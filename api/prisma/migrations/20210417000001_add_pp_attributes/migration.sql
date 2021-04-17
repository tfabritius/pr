ALTER TABLE "portfolios_securities"
ADD COLUMN "calendar" TEXT,
ADD COLUMN "feed" TEXT,
ADD COLUMN "feed_url" TEXT,
ADD COLUMN "latest_feed" TEXT,
ADD COLUMN "latest_feed_url" TEXT,
ADD COLUMN "attributes" JSONB,
ADD COLUMN "events" JSONB,
ADD COLUMN "properties" JSONB;
