const express = require("express");
const cors = require("cors");

const accountsRouter = require("./routes/accounts");
const transactionsRouter = require("./routes/transactions");
const budgetsRouter = require("./routes/budgets");
const potsRouter = require("./routes/pots");
const billsRouter = require("./routes/recurringBills");
const reportsRouter = require("./routes/reports");
const categoriesRouter = require("./routes/categories");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/pots", potsRouter);
app.use("/api/recurring-bills", billsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/categories", categoriesRouter);

app.use(errorHandler);

module.exports = app;
