ALTER TABLE "portfolios_accounts" ALTER COLUMN "note" SET DEFAULT E'';

ALTER TABLE "portfolios_securities"
ALTER COLUMN "isin" SET DEFAULT E'',
ALTER COLUMN "wkn" SET DEFAULT E'',
ALTER COLUMN "symbol" SET DEFAULT E'',
ALTER COLUMN "note" SET DEFAULT E'';

ALTER TABLE "portfolios_transactions" ALTER COLUMN "note" SET DEFAULT E'';
