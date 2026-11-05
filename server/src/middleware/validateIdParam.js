const { parseId } = require("../utils/ids");

// For router.param("id", validateIdParam): runs once for every route that has
// an :id segment, so no handler has to remember to check it itself.
module.exports = (req, res, next, value) => {
  if (parseId(value) === null) {
    return res.status(400).json({ error: "Invalid id" });
  }
  next();
};
