/*
  Warnings:

  - You are about to drop the column `adult` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `availabilityDate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `costOfGoodsSold` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `customLabel2` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `customLabel3` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `customLabel4` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `freeShippingThreshold` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `googleProductCategory` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `gtin` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `identifierExists` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `maxHandlingTime` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minHandlingTime` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productHeight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productLength` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productTypes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productWeight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productWidth` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shipping` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingHeight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingLength` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingWeight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingWidth` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `taxCategory` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `taxes` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "adult",
DROP COLUMN "availabilityDate",
DROP COLUMN "costOfGoodsSold",
DROP COLUMN "customLabel2",
DROP COLUMN "customLabel3",
DROP COLUMN "customLabel4",
DROP COLUMN "expirationDate",
DROP COLUMN "freeShippingThreshold",
DROP COLUMN "googleProductCategory",
DROP COLUMN "gtin",
DROP COLUMN "identifierExists",
DROP COLUMN "maxHandlingTime",
DROP COLUMN "minHandlingTime",
DROP COLUMN "productHeight",
DROP COLUMN "productLength",
DROP COLUMN "productTypes",
DROP COLUMN "productWeight",
DROP COLUMN "productWidth",
DROP COLUMN "shipping",
DROP COLUMN "shippingHeight",
DROP COLUMN "shippingLength",
DROP COLUMN "shippingWeight",
DROP COLUMN "shippingWidth",
DROP COLUMN "taxCategory",
DROP COLUMN "taxes";
