/*
  Warnings:

  - You are about to drop the column `stock_quantity` on the `parts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `parts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_hash]` on the table `quotes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authorization_id]` on the table `quotes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tracking_token_hash]` on the table `work_orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `customers` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `sku` to the `parts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tracking_token_expires_at` to the `work_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tracking_token_hash` to the `work_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "parts" DROP COLUMN "stock_quantity",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sku" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "authorization_id" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "token_hash" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PREPARED';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "estimated_minutes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "tracking_token_expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tracking_token_hash" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'RECEBIDA';

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "encrypted_payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "next_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_status_created_at_idx" ON "notifications"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "parts_sku_key" ON "parts"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_token_hash_key" ON "quotes"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_authorization_id_key" ON "quotes"("authorization_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_tracking_token_hash_key" ON "work_orders"("tracking_token_hash");
