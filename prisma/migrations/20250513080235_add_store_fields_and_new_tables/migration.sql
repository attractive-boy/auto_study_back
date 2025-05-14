/*
  Warnings:

  - Added the required column `availableSeats` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingProcess` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessEnd` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessStart` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notice` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSeats` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` ADD COLUMN `availableSeats` INTEGER NOT NULL,
    ADD COLUMN `bookingProcess` TEXT NOT NULL,
    ADD COLUMN `businessEnd` VARCHAR(191) NOT NULL,
    ADD COLUMN `businessStart` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` TEXT NOT NULL,
    ADD COLUMN `latitude` DOUBLE NOT NULL,
    ADD COLUMN `longitude` DOUBLE NOT NULL,
    ADD COLUMN `notice` TEXT NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalSeats` INTEGER NOT NULL,
    ADD COLUMN `wifiAccount` VARCHAR(191) NULL,
    ADD COLUMN `wifiPassword` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `StoreAnnouncement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `description` TEXT NOT NULL,
    `validityPeriod` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StoreAnnouncement` ADD CONSTRAINT `StoreAnnouncement_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher` ADD CONSTRAINT `Voucher_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
