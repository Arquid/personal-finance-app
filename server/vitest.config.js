const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    // All integration tests in tests/*.test.js share one real Postgres test
    // database. Vitest runs test files in parallel by default, so any test
    // that reads across the whole table (not just rows it created itself)
    // can race against another file's concurrent inserts/deletes. Running
    // files sequentially trades a bit of speed for full determinism.
    fileParallelism: false,
  },
});
