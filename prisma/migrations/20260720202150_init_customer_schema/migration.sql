/*
  Warnings:

  - You are about to drop the column `Employer` on the `Customer` table. All the data in the column will be lost.

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
    "Duration" TEXT,
    "Timeline" TEXT,
    "MaxNegativeCashFlow" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("AvailableAssetsWorth", "AvailableCapital", "ContractType", "Duration", "Email", "EmploymentStatus", "FullName", "HouseHoldSize", "ID", "MaxNegativeCashFlow", "Phone", "PreferredLanguage", "PreferredLocations", "PreferredPropertyTypes", "Timeline", "createdAt", "updatedAt") SELECT "AvailableAssetsWorth", "AvailableCapital", "ContractType", "Duration", "Email", "EmploymentStatus", "FullName", "HouseHoldSize", "ID", "MaxNegativeCashFlow", "Phone", "PreferredLanguage", "PreferredLocations", "PreferredPropertyTypes", "Timeline", "createdAt", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
