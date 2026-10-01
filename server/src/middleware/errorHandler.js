const { Prisma } = require("@prisma/client");
const multer = require("multer");

// Prisma errors that mean "the client sent a value the database can't store".
const BAD_VALUE_CODES = new Set(["P2000", "P2020", "P2023"]);

module.exports = (err, req, res, next) => {
  // The full error (including Prisma's message with file paths and query
  // details) goes to the server log only, never into the response.
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = err.meta?.target?.join(", ") || "field";
      return res.status(409).json({ error: `A record with this ${fields} already exists.` });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found." });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Referenced record does not exist." });
    }
    if (BAD_VALUE_CODES.has(err.code)) {
      return res.status(400).json({ error: "Invalid request data." });
    }
  }

  // Raised when a value has the wrong shape for the query, e.g. a non-numeric id.
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: "Invalid request data." });
  }

  const status = err.status || 500;
  if (status >= 500) {
    return res.status(status).json({ error: "Internal server error" });
  }
  res.status(status).json({ error: err.message || "Request failed" });
};
