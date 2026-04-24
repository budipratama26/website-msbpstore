/*
  Warnings:

  - Added the required column `reward` to the `RedeemCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RedeemCode" DROP CONSTRAINT "RedeemCode_productId_fkey";

-- AlterTable
ALTER TABLE "RedeemCode" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reward" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RedeemCode" ADD CONSTRAINT "RedeemCode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
