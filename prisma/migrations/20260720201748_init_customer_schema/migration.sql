/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assetsCents` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `availableCapitalCents` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `contractType` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `employer` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `employmentStatus` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `householdSize` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `investmentGoal` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `maxNegativeCashFlowCents` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLanguage` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLocations` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `preferredPropertyType` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `Customer` table. All the data in the column will be lost.
  - The primary key for the `DocumentItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customerId` on the `DocumentItem` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `DocumentItem` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `DocumentItem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `DocumentItem` table. All the data in the column will be lost.
  - The primary key for the `ExpenseItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customerId` on the `ExpenseItem` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ExpenseItem` table. All the data in the column will be lost.
  - You are about to drop the column `isLoanPayment` on the `ExpenseItem` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `ExpenseItem` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyAmountCents` on the `ExpenseItem` table. All the data in the column will be lost.
  - The primary key for the `IncomeSource` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `customerId` on the `IncomeSource` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `IncomeSource` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `IncomeSource` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyNetCents` on the `IncomeSource` table. All the data in the column will be lost.
  - Added the required column `FullName` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CustomerID` to the `DocumentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `DocumentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Type` to the `DocumentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CustomerID` to the `ExpenseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `ExpenseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Label` to the `ExpenseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MonthlyExpend` to the `ExpenseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CustomerID` to the `IncomeSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID` to the `IncomeSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Label` to the `IncomeSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MonthlyIncome` to the `IncomeSource` table without a default value. This is not possible if the table is not empty.

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
    "Employer" TEXT,
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
INSERT INTO "new_Customer" ("createdAt", "updatedAt") SELECT "createdAt", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE TABLE "new_DocumentItem" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Type" TEXT NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'MISSING',
    "CustomerID" INTEGER NOT NULL,
    CONSTRAINT "DocumentItem_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customer" ("ID") ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE "DocumentItem";
ALTER TABLE "new_DocumentItem" RENAME TO "DocumentItem";
CREATE TABLE "new_ExpenseItem" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Label" TEXT NOT NULL,
    "MonthlyExpend" INTEGER NOT NULL,
    "IsLoanPayment" BOOLEAN NOT NULL DEFAULT false,
    "CustomerID" INTEGER NOT NULL,
    CONSTRAINT "ExpenseItem_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customer" ("ID") ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE "ExpenseItem";
ALTER TABLE "new_ExpenseItem" RENAME TO "ExpenseItem";
CREATE TABLE "new_IncomeSource" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Label" TEXT NOT NULL,
    "MonthlyIncome" INTEGER NOT NULL,
    "CustomerID" INTEGER NOT NULL,
    CONSTRAINT "IncomeSource_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customer" ("ID") ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE "IncomeSource";
ALTER TABLE "new_IncomeSource" RENAME TO "IncomeSource";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
