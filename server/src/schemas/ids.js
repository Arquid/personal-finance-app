const { z } = require("zod");
const { MAX_ID } = require("../utils/ids");

// A foreign-key id in a request body: a positive integer that fits an Int column.
const idField = (requiredMessage) =>
  z.coerce.number().int().positive(requiredMessage).max(MAX_ID, "Invalid id");

module.exports = { idField };
