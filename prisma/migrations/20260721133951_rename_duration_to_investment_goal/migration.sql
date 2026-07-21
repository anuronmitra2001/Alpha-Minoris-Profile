/*
  Warnings:

  - You are about to drop the column `Duration` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `UpdatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FullName" TEXT NOT NULL,
    "Email" TEXT,
    "Phone" TEXT,
    "HouseHoldSize" INTEGER,
    "PreferredLanguage" TEXT,
    "EmploymentStatus" TEXT,
    "EmployerName" TEXT,
    "ContractType" TEXT,
    "AvailableCapital" INTEGER,
    "AvailableAssetsWorth" INTEGER,
    "PreferredLocations" TEXT,
    "PreferredPropertyTypes" TEXT,
    "InvestmentGoal" TEXT,
    "Timeline" TEXT,
    "MaxNegativeCashFlow" INTEGER,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("AvailableAssetsWorth", "AvailableCapital", "ContractType", "Email", "EmployerName", "EmploymentStatus", "FullName", "HouseHoldSize", "ID", "MaxNegativeCashFlow", "Phone", "PreferredLanguage", "PreferredLocations", "PreferredPropertyTypes", "Timeline") SELECT "AvailableAssetsWorth", "AvailableCapital", "ContractType", "Email", "EmployerName", "EmploymentStatus", "FullName", "HouseHoldSize", "ID", "MaxNegativeCashFlow", "Phone", "PreferredLanguage", "PreferredLocations", "PreferredPropertyTypes", "Timeline" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
