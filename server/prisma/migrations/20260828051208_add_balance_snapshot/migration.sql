-- CreateTable
CREATE TABLE "BalanceSnapshot" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "totalBalance" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSnapshot_date_key" ON "BalanceSnapshot"("date");
