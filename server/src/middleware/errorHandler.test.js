import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { Prisma } = require("@prisma/client");
const errorHandler = require("./errorHandler");

function run(err) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  errorHandler(err, {}, res, () => {});
  return { status: res.status.mock.calls[0][0], body: res.json.mock.calls[0][0] };
}

describe("errorHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a generic message for unexpected errors instead of leaking internals", () => {
    const leaky = new Error(
      "\nInvalid `prisma.account.create()` invocation in\nC:\\Users\\someone\\server\\src\\routes\\accounts.js:29:42",
    );
    const { status, body } = run(leaky);

    expect(status).toBe(500);
    expect(body).toEqual({ error: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/prisma|C:\\|accounts\.js/i);
  });

  it("still logs the full error on the server", () => {
    const err = new Error("secret detail");
    run(err);
    expect(console.error).toHaveBeenCalledWith(err);
  });

  it("keeps the message of errors that deliberately carry a client-facing status", () => {
    const err = Object.assign(new Error("Source account not found"), { status: 404 });
    expect(run(err)).toEqual({ status: 404, body: { error: "Source account not found" } });
  });

  it("hides the message of errors that carry a 5xx status too", () => {
    const err = Object.assign(new Error("db connection string is postgres://user:pw@host"), { status: 503 });
    expect(run(err)).toEqual({ status: 503, body: { error: "Internal server error" } });
  });

  it("turns a Prisma validation error (e.g. a non-numeric id) into a 400 without Prisma's message", () => {
    const err = new Prisma.PrismaClientValidationError("Invalid `prisma.account.findUnique()` ... C:\\secret", {
      clientVersion: "test",
    });
    const { status, body } = run(err);

    expect(status).toBe(400);
    expect(body).toEqual({ error: "Invalid request data." });
  });

  it("maps known Prisma request errors to client-facing statuses", () => {
    const known = (code, meta) =>
      new Prisma.PrismaClientKnownRequestError("internal message", { code, clientVersion: "test", meta });

    expect(run(known("P2002", { target: ["name"] }))).toEqual({
      status: 409,
      body: { error: "A record with this name already exists." },
    });
    expect(run(known("P2025")).status).toBe(404);
    expect(run(known("P2003")).status).toBe(400);
    expect(run(known("P2020")).status).toBe(400);
  });

  it("reports multer upload errors as 400", () => {
    const { status, body } = run(new (require("multer").MulterError)("LIMIT_FILE_SIZE"));
    expect(status).toBe(400);
    expect(body.error).toMatch(/File upload error/);
  });
});
