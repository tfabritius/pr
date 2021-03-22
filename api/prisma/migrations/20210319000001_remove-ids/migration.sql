-- Drop foreign keys
ALTER TABLE "portfolios_accounts" DROP CONSTRAINT "portfolios_accounts_reference_account_id_fkey";
ALTER TABLE "portfolios_securities_prices" DROP CONSTRAINT "portfolios_securities_prices_security_id_fkey";
ALTER TABLE "portfolios_transactions" DROP CONSTRAINT "portfolios_transactions_account_id_fkey";
ALTER TABLE "portfolios_transactions" DROP CONSTRAINT "portfolios_transactions_partner_transaction_id_fkey";
ALTER TABLE "portfolios_transactions" DROP CONSTRAINT "portfolios_transactions_security_id_fkey";
ALTER TABLE "portfolios_transactions_units" DROP CONSTRAINT "portfolios_transactions_units_transaction_id_fkey";

-- Migrate portfolios_accounts
ALTER TABLE "portfolios_accounts"
DROP CONSTRAINT "portfolios_accounts_pkey",
DROP COLUMN "id",
DROP COLUMN "reference_account_id",
ADD COLUMN "reference_account_uuid" UUID,
ADD PRIMARY KEY ("portfolio_id", "uuid");

-- Migrate portfolios_securities
ALTER TABLE "portfolios_securities"
DROP CONSTRAINT "portfolios_securities_pkey",
DROP COLUMN "id",
ADD PRIMARY KEY ("portfolio_id", "uuid");

-- Migrate portfolios_securities_prices
DROP INDEX "portfolios_securities_prices.security_id_index";

ALTER TABLE "portfolios_securities_prices"
DROP CONSTRAINT "portfolios_securities_prices_pkey",
DROP COLUMN "security_id",
ADD COLUMN "portfolio_id" INTEGER NOT NULL,
ADD COLUMN "portfolio_security_uuid" UUID NOT NULL,
ADD PRIMARY KEY ("portfolio_id", "portfolio_security_uuid", "date");

CREATE INDEX "portfolios_securities_prices.portfolio_id_portfolio_security_uuid_index" ON "portfolios_securities_prices"("portfolio_id", "portfolio_security_uuid");

-- Migrate portfolios_transactions
DROP INDEX "portfolios_transactions.partner_transaction_id_unique";
DROP INDEX "portfolios_transactions.account_id_index";
DROP INDEX "portfolios_transactions.security_id_index";

ALTER TABLE "portfolios_transactions"
DROP CONSTRAINT "portfolios_transactions_pkey",
DROP COLUMN "id",
ADD COLUMN "uuid" UUID NOT NULL,
DROP COLUMN "account_id",
ADD COLUMN "account_uuid" UUID NOT NULL,
DROP COLUMN "partner_transaction_id",
ADD COLUMN "partner_transaction_uuid" UUID,
DROP COLUMN "security_id",
ADD COLUMN "portfolio_security_uuid" UUID,
ADD PRIMARY KEY ("portfolio_id", "uuid");

CREATE UNIQUE INDEX "portfolios_transactions.portfolio_id_partner_transaction_uuid_unique" ON "portfolios_transactions"("portfolio_id", "partner_transaction_uuid");
CREATE INDEX "portfolios_transactions.portfolio_id_account_uuid_index" ON "portfolios_transactions"("portfolio_id", "account_uuid");
CREATE INDEX "portfolios_transactions.portfolio_id_portfolio_security_uuid_index" ON "portfolios_transactions"("portfolio_id", "portfolio_security_uuid");

-- Migrate portfolios_transactions_units
DROP INDEX "portfolios_transactions_units.transaction_id_index";

ALTER TABLE "portfolios_transactions_units"
DROP COLUMN "transaction_id",
ADD COLUMN "portfolio_id" INTEGER NOT NULL,
ADD COLUMN "transaction_uuid" UUID NOT NULL;

CREATE INDEX "portfolios_transactions_units.portfolio_id_transaction_uuid_index" ON "portfolios_transactions_units"("portfolio_id", "transaction_uuid");

-- Add foreign keys
ALTER TABLE "portfolios_accounts" ADD FOREIGN KEY ("portfolio_id", "reference_account_uuid") REFERENCES "portfolios_accounts"("portfolio_id", "uuid") ON UPDATE CASCADE;
ALTER TABLE "portfolios_securities_prices" ADD FOREIGN KEY ("portfolio_id", "portfolio_security_uuid") REFERENCES "portfolios_securities"("portfolio_id", "uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("portfolio_id", "account_uuid") REFERENCES "portfolios_accounts"("portfolio_id", "uuid") ON UPDATE CASCADE;
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("portfolio_id", "partner_transaction_uuid") REFERENCES "portfolios_transactions"("portfolio_id", "uuid") ON UPDATE CASCADE;
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("portfolio_id", "portfolio_security_uuid") REFERENCES "portfolios_securities"("portfolio_id", "uuid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "portfolios_transactions_units" ADD FOREIGN KEY ("portfolio_id", "transaction_uuid") REFERENCES "portfolios_transactions"("portfolio_id", "uuid") ON DELETE CASCADE ON UPDATE CASCADE;
