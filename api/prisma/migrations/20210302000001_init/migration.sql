-- CreateEnum
CREATE TYPE "portfolio_account_type" AS ENUM ('deposit', 'securities');

-- CreateEnum
CREATE TYPE "portfolio_transaction_type" AS ENUM ('Payment', 'CurrencyTransfer', 'DepositInterest', 'DepositFee', 'DepositTax', 'SecuritiesOrder', 'SecuritiesDividend', 'SecuritiesFee', 'SecuritiesTax', 'SecuritiesTransfer');

-- CreateEnum
CREATE TYPE "portfolio_transaction_unit_type" AS ENUM ('base', 'tax', 'fee');

-- CreateTable
CREATE TABLE "portfolios_accounts" (
    "id" SERIAL NOT NULL,
    "type" "portfolio_account_type" NOT NULL,
    "name" VARCHAR NOT NULL,
    "uuid" UUID NOT NULL,
    "currency_code" CHAR(3),
    "reference_account_id" INTEGER,
    "active" BOOLEAN NOT NULL,
    "note" VARCHAR NOT NULL,
    "portfolio_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientupdates" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "version" TEXT NOT NULL,
    "country" TEXT,
    "useragent" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "code" CHAR(3) NOT NULL,

    PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "amount" DECIMAL(10,4),
    "currency_code" CHAR(3),
    "ratio" VARCHAR(10),
    "security_uuid" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchangerates" (
    "id" SERIAL NOT NULL,
    "base_currency_code" CHAR(3) NOT NULL,
    "quote_currency_code" CHAR(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchangerates_prices" (
    "exchangerate_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "value" DECIMAL(16,8) NOT NULL,

    PRIMARY KEY ("exchangerate_id","date")
);

-- CreateTable
CREATE TABLE "markets" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "note" VARCHAR NOT NULL,
    "base_currency_code" CHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios_securities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "uuid" UUID NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "isin" VARCHAR NOT NULL,
    "wkn" VARCHAR NOT NULL,
    "symbol" VARCHAR NOT NULL,
    "active" BOOLEAN NOT NULL,
    "note" VARCHAR NOT NULL,
    "portfolio_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios_securities_prices" (
    "security_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "value" DECIMAL(16,8) NOT NULL,

    PRIMARY KEY ("security_id","date")
);

-- CreateTable
CREATE TABLE "securities" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "isin" VARCHAR(12),
    "wkn" VARCHAR(6),
    "symbol_xfra" VARCHAR(10),
    "symbol_xnas" VARCHAR(10),
    "symbol_xnys" VARCHAR(10),
    "security_type" TEXT,

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "securities_markets" (
    "id" SERIAL NOT NULL,
    "security_uuid" UUID NOT NULL,
    "market_code" TEXT NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "first_price_date" DATE,
    "last_price_date" DATE,
    "symbol" VARCHAR(10),
    "update_prices" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "securities_markets_prices" (
    "security_market_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "close" DECIMAL(10,4) NOT NULL,

    PRIMARY KEY ("security_market_id","date")
);

-- CreateTable
CREATE TABLE "securities_taxonomies" (
    "security_uuid" UUID NOT NULL,
    "taxonomy_uuid" UUID NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,

    PRIMARY KEY ("taxonomy_uuid","security_uuid")
);

-- CreateTable
CREATE TABLE "sessions" (
    "token" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL DEFAULT E'',
    "user_id" INTEGER NOT NULL,

    PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "taxonomies" (
    "uuid" UUID NOT NULL,
    "parent_uuid" UUID,
    "root_uuid" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT,

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "portfolios_transactions" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "type" "portfolio_transaction_type" NOT NULL,
    "datetime" TIMESTAMPTZ NOT NULL,
    "partner_transaction_id" INTEGER,
    "shares" DECIMAL(16,8),
    "security_id" INTEGER,
    "note" VARCHAR NOT NULL,
    "portfolio_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios_transactions_units" (
    "id" SERIAL NOT NULL,
    "type" "portfolio_transaction_unit_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "original_amount" DECIMAL(10,2),
    "original_currency_code" CHAR(3),
    "exchange_rate" DECIMAL(16,8),
    "transaction_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "password" VARCHAR,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolios_accounts.portfolio_id_index" ON "portfolios_accounts"("portfolio_id");

-- CreateIndex
CREATE INDEX "clientupdates_country" ON "clientupdates"("country");

-- CreateIndex
CREATE INDEX "clientupdates_timestamp" ON "clientupdates"("timestamp");

-- CreateIndex
CREATE INDEX "clientupdates_version" ON "clientupdates"("version");

-- CreateIndex
CREATE INDEX "events_security_uuid" ON "events"("security_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "exchangerates.base_currency_code_quote_currency_code_unique" ON "exchangerates"("base_currency_code", "quote_currency_code");

-- CreateIndex
CREATE INDEX "exchangerates_prices.exchangerate_id_index" ON "exchangerates_prices"("exchangerate_id");

-- CreateIndex
CREATE INDEX "portfolios.user_id_index" ON "portfolios"("user_id");

-- CreateIndex
CREATE INDEX "portfolios_securities.portfolio_id_index" ON "portfolios_securities"("portfolio_id");

-- CreateIndex
CREATE INDEX "portfolios_securities_prices.security_id_index" ON "portfolios_securities_prices"("security_id");

-- CreateIndex
CREATE INDEX "securities_isin" ON "securities"("isin");

-- CreateIndex
CREATE INDEX "securities_name" ON "securities"("name");

-- CreateIndex
CREATE INDEX "securities_security_type" ON "securities"("security_type");

-- CreateIndex
CREATE INDEX "securities_symbol_xfra" ON "securities"("symbol_xfra");

-- CreateIndex
CREATE INDEX "securities_symbol_xnas" ON "securities"("symbol_xnas");

-- CreateIndex
CREATE INDEX "securities_symbol_xnys" ON "securities"("symbol_xnys");

-- CreateIndex
CREATE INDEX "securities_wkn" ON "securities"("wkn");

-- CreateIndex
CREATE UNIQUE INDEX "securities_markets_security_uuid_market_code" ON "securities_markets"("security_uuid", "market_code");

-- CreateIndex
CREATE INDEX "securities_markets_security_uuid" ON "securities_markets"("security_uuid");

-- CreateIndex
CREATE INDEX "securities_markets_prices.security_market_id_index" ON "securities_markets_prices"("security_market_id");

-- CreateIndex
CREATE INDEX "sessions.user_id_index" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions.last_activity_at_index" ON "sessions"("last_activity_at");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomies_root_uuid_code" ON "taxonomies"("root_uuid", "code");

-- CreateIndex
CREATE INDEX "taxonomies_parent_uuid" ON "taxonomies"("parent_uuid");

-- CreateIndex
CREATE INDEX "taxonomies_root_uuid" ON "taxonomies"("root_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_transactions.partner_transaction_id_unique" ON "portfolios_transactions"("partner_transaction_id");

-- CreateIndex
CREATE INDEX "portfolios_transactions.account_id_index" ON "portfolios_transactions"("account_id");

-- CreateIndex
CREATE INDEX "portfolios_transactions.portfolio_id_index" ON "portfolios_transactions"("portfolio_id");

-- CreateIndex
CREATE INDEX "portfolios_transactions.security_id_index" ON "portfolios_transactions"("security_id");

-- CreateIndex
CREATE INDEX "portfolios_transactions_units.transaction_id_index" ON "portfolios_transactions_units"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "users.username_unique" ON "users"("username");

-- AddForeignKey
ALTER TABLE "portfolios_accounts" ADD FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_accounts" ADD FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_accounts" ADD FOREIGN KEY ("reference_account_id") REFERENCES "portfolios_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD FOREIGN KEY ("security_uuid") REFERENCES "securities"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchangerates" ADD FOREIGN KEY ("base_currency_code") REFERENCES "currencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchangerates" ADD FOREIGN KEY ("quote_currency_code") REFERENCES "currencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchangerates_prices" ADD FOREIGN KEY ("exchangerate_id") REFERENCES "exchangerates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD FOREIGN KEY ("base_currency_code") REFERENCES "currencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_securities" ADD FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_securities" ADD FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_securities_prices" ADD FOREIGN KEY ("security_id") REFERENCES "portfolios_securities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "securities_markets" ADD FOREIGN KEY ("security_uuid") REFERENCES "securities"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "securities_markets" ADD FOREIGN KEY ("market_code") REFERENCES "markets"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "securities_markets" ADD FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "securities_markets_prices" ADD FOREIGN KEY ("security_market_id") REFERENCES "securities_markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "securities_taxonomies" ADD FOREIGN KEY ("security_uuid") REFERENCES "securities"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "securities_taxonomies" ADD FOREIGN KEY ("taxonomy_uuid") REFERENCES "taxonomies"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxonomies" ADD FOREIGN KEY ("parent_uuid") REFERENCES "taxonomies"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxonomies" ADD FOREIGN KEY ("root_uuid") REFERENCES "taxonomies"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("account_id") REFERENCES "portfolios_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("partner_transaction_id") REFERENCES "portfolios_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions" ADD FOREIGN KEY ("security_id") REFERENCES "portfolios_securities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions_units" ADD FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions_units" ADD FOREIGN KEY ("original_currency_code") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios_transactions_units" ADD FOREIGN KEY ("transaction_id") REFERENCES "portfolios_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
