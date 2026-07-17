const { Prisma } = require("@prisma/client");
const multer = require("multer");

module.exports = (err, req, res, next) => {
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
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
};
