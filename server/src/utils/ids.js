// Largest value an Int column can hold. Anything bigger can never match a row
// and makes Prisma throw, so it is rejected as a malformed id instead.
const MAX_ID = 2_147_483_647;

// A database id is a plain positive integer. Number("1.5"), Number("0x1") and
// Number("1e0") all look numeric to JavaScript, so ids from a URL or query
// string are matched against a strict pattern rather than converted and hoped
// for the best.
function parseId(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 1 && value <= MAX_ID ? value : null;
  }
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value)) return null;
  const id = Number(value);
  return id <= MAX_ID ? id : null;
}

module.exports = { MAX_ID, parseId };
