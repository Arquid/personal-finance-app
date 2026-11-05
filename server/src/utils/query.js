const { parseId } = require("./ids");

// Upper bound for ?page=, so an absurd value can't push OFFSET past what the
// database accepts. Real data never gets near a million pages.
const MAX_PAGE = 1_000_000;

function badQuery(name) {
  return Object.assign(new Error(`Invalid query parameter: ${name}`), { status: 400 });
}

// Express hands back an array or object for ?x=1&x=2 or ?x[a]=1, which would
// crash a bare .trim(). Only a plain string (or nothing) is accepted.
function queryString(req, name) {
  const value = req.query[name];
  if (value === undefined) return "";
  if (typeof value !== "string") throw badQuery(name);
  return value.trim();
}

// An optional ?accountId= filter: undefined when absent or blank, otherwise a
// strictly parsed id, or a 400 when it isn't one.
function queryAccountId(req) {
  const raw = queryString(req, "accountId");
  if (raw === "") return undefined;
  const id = parseId(raw);
  if (id === null) throw badQuery("accountId");
  return id;
}

module.exports = { MAX_PAGE, queryString, queryAccountId };
