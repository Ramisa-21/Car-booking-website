/*
  Warnings:

  - Added the required column `userId` to the `rideSearch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `scheduledRides` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ridesearch` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `scheduledrides` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `rideSearch` ADD CONSTRAINT `rideSearch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduledRides` ADD CONSTRAINT `scheduledRides_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
