/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `storeimage` table. All the data in the column will be lost.
  - Added the required column `imageName` to the `StoreImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `storeimage` DROP COLUMN `imageUrl`,
    ADD COLUMN `imageName` VARCHAR(191) NOT NULL;
