ALTER TABLE "portfolios_securities"
ADD COLUMN "security_uuid" UUID,
ADD FOREIGN KEY ("security_uuid") REFERENCES "securities"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
