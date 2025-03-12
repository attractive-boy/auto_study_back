-- CreateTable
CREATE TABLE `system_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `context` JSON NULL,
    `source` VARCHAR(191) NULL,
    `traceId` VARCHAR(191) NULL,
    `metadata` JSON NULL,

    INDEX `system_logs_level_idx`(`level`),
    INDEX `system_logs_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `method` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `statusCode` INTEGER NOT NULL,
    `requestBody` JSON NULL,
    `responseBody` JSON NULL,
    `duration` INTEGER NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NULL,

    INDEX `api_logs_timestamp_idx`(`timestamp`),
    INDEX `api_logs_statusCode_idx`(`statusCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `error_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `error` TEXT NOT NULL,
    `stack` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` JSON NULL,
    `severity` VARCHAR(191) NOT NULL,

    INDEX `error_logs_timestamp_idx`(`timestamp`),
    INDEX `error_logs_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
