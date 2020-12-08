import { MigrationInterface, QueryRunner } from 'typeorm'

export class init1607452173971 implements MigrationInterface {
  name = 'init1607452173971'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "accounts" (
                "id" SERIAL NOT NULL,
                "type" character varying NOT NULL,
                "name" character varying NOT NULL,
                "uuid" character varying NOT NULL,
                "currency_code" character varying,
                "reference_account_id" integer,
                "note" character varying NOT NULL,
                "portfolio_id" integer NOT NULL,
                CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_e1a05c56032c1c31d04c4ad93f" ON "accounts" ("portfolio_id")
        `)
    await queryRunner.query(`
            CREATE TABLE "transactions_units" (
                "id" SERIAL NOT NULL,
                "type" character varying NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "currency_code" character varying NOT NULL,
                "original_amount" numeric(10, 2),
                "original_currency_code" character varying,
                "exchange_rate" numeric(10, 4),
                "transaction_id" integer NOT NULL,
                CONSTRAINT "PK_b1ec940819a88ccb1c71920a6e3" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_142a786906997107d9b0d1258f" ON "transactions_units" ("transaction_id")
        `)
    await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" SERIAL NOT NULL,
                "account_id" integer NOT NULL,
                "type" character varying NOT NULL,
                "datetime" TIMESTAMP WITH TIME ZONE NOT NULL,
                "partner_transaction_id" integer,
                "shares" numeric(12, 6),
                "security_id" integer,
                "note" character varying NOT NULL,
                "portfolio_id" integer NOT NULL,
                CONSTRAINT "REL_de753ae74e3122a538dbb7a77b" UNIQUE ("partner_transaction_id"),
                CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_6a323de73ef7d943df41a4fdd2" ON "transactions" ("portfolio_id")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_49c0d6e8ba4bfb5582000d851f" ON "transactions" ("account_id")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_9cb5d1be66e92b4763281199d1" ON "transactions" ("security_id")
        `)
    await queryRunner.query(`
            CREATE TABLE "securities" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "uuid" character varying NOT NULL,
                "currency_code" character varying NOT NULL,
                "isin" character varying NOT NULL,
                "wkn" character varying NOT NULL,
                "symbol" character varying NOT NULL,
                "note" character varying NOT NULL,
                "portfolio_id" integer NOT NULL,
                CONSTRAINT "PK_2f2a80064c5bce5a8ff134a38a8" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_3821d01657b92c92d505cfe8ed" ON "securities" ("portfolio_id")
        `)
    await queryRunner.query(`
            CREATE TABLE "portfolios" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "note" character varying NOT NULL,
                "base_currency_code" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_488aa6e9b219d1d9087126871ae" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_57fba72db5ac40768b40f0ecfa" ON "portfolios" ("user_id")
        `)
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "username" character varying NOT NULL,
                "password" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "last_seen_at" date NOT NULL DEFAULT CURRENT_DATE,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username")
        `)
    await queryRunner.query(`
            CREATE TABLE "sessions" (
                "token" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "last_activity_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_e9f62f5dcb8a54b84234c9e7a06" PRIMARY KEY ("token")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id")
        `)
    await queryRunner.query(`
            CREATE TABLE "exchangerates_prices" (
                "exchangerate_id" integer NOT NULL,
                "date" date NOT NULL,
                "value" numeric(12, 6) NOT NULL,
                CONSTRAINT "PK_3b99777b6b91a9986b86f57bfb6" PRIMARY KEY ("exchangerate_id", "date")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "exchangerates" (
                "id" SERIAL NOT NULL,
                "base_currency_code" character varying NOT NULL,
                "quote_currency_code" character varying NOT NULL,
                CONSTRAINT "PK_a8eb1b05080d28879c877d5cd24" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_215ebb92677c9c2442e35c74fd" ON "exchangerates" ("base_currency_code", "quote_currency_code")
        `)
    await queryRunner.query(`
            CREATE TABLE "currencies" (
                "code" character varying NOT NULL,
                CONSTRAINT "PK_9f8d0972aeeb5a2277e40332d29" PRIMARY KEY ("code")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "FK_5a58c9139d33597696dd6b3caae" FOREIGN KEY ("reference_account_id") REFERENCES "accounts"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "FK_e1a05c56032c1c31d04c4ad93f4" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions_units"
            ADD CONSTRAINT "FK_142a786906997107d9b0d1258ff" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_6a323de73ef7d943df41a4fdd20" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_de753ae74e3122a538dbb7a77b3" FOREIGN KEY ("partner_transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_9cb5d1be66e92b4763281199d12" FOREIGN KEY ("security_id") REFERENCES "securities"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "securities"
            ADD CONSTRAINT "FK_3821d01657b92c92d505cfe8ed9" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "portfolios"
            ADD CONSTRAINT "FK_57fba72db5ac40768b40f0ecfa1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "sessions"
            ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "exchangerates_prices"
            ADD CONSTRAINT "FK_23d2485b433791f099c3b4f9548" FOREIGN KEY ("exchangerate_id") REFERENCES "exchangerates"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "exchangerates"
            ADD CONSTRAINT "FK_215d3e767f6be0789819e0d3646" FOREIGN KEY ("base_currency_code") REFERENCES "currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "exchangerates"
            ADD CONSTRAINT "FK_f2409de5d179af777f642108a59" FOREIGN KEY ("quote_currency_code") REFERENCES "currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "exchangerates" DROP CONSTRAINT "FK_f2409de5d179af777f642108a59"
        `)
    await queryRunner.query(`
            ALTER TABLE "exchangerates" DROP CONSTRAINT "FK_215d3e767f6be0789819e0d3646"
        `)
    await queryRunner.query(`
            ALTER TABLE "exchangerates_prices" DROP CONSTRAINT "FK_23d2485b433791f099c3b4f9548"
        `)
    await queryRunner.query(`
            ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"
        `)
    await queryRunner.query(`
            ALTER TABLE "portfolios" DROP CONSTRAINT "FK_57fba72db5ac40768b40f0ecfa1"
        `)
    await queryRunner.query(`
            ALTER TABLE "securities" DROP CONSTRAINT "FK_3821d01657b92c92d505cfe8ed9"
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_9cb5d1be66e92b4763281199d12"
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_de753ae74e3122a538dbb7a77b3"
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0"
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_6a323de73ef7d943df41a4fdd20"
        `)
    await queryRunner.query(`
            ALTER TABLE "transactions_units" DROP CONSTRAINT "FK_142a786906997107d9b0d1258ff"
        `)
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "FK_e1a05c56032c1c31d04c4ad93f4"
        `)
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "FK_5a58c9139d33597696dd6b3caae"
        `)
    await queryRunner.query(`
            DROP TABLE "currencies"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_215ebb92677c9c2442e35c74fd"
        `)
    await queryRunner.query(`
            DROP TABLE "exchangerates"
        `)
    await queryRunner.query(`
            DROP TABLE "exchangerates_prices"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_085d540d9f418cfbdc7bd55bb1"
        `)
    await queryRunner.query(`
            DROP TABLE "sessions"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"
        `)
    await queryRunner.query(`
            DROP TABLE "users"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_57fba72db5ac40768b40f0ecfa"
        `)
    await queryRunner.query(`
            DROP TABLE "portfolios"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_3821d01657b92c92d505cfe8ed"
        `)
    await queryRunner.query(`
            DROP TABLE "securities"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_9cb5d1be66e92b4763281199d1"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_49c0d6e8ba4bfb5582000d851f"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_6a323de73ef7d943df41a4fdd2"
        `)
    await queryRunner.query(`
            DROP TABLE "transactions"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_142a786906997107d9b0d1258f"
        `)
    await queryRunner.query(`
            DROP TABLE "transactions_units"
        `)
    await queryRunner.query(`
            DROP INDEX "IDX_e1a05c56032c1c31d04c4ad93f"
        `)
    await queryRunner.query(`
            DROP TABLE "accounts"
        `)
  }
}
