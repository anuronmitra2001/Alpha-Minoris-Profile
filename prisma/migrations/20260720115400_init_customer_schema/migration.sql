-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "householdSize" INTEGER,
    "preferredLanguage" TEXT,
    "employmentStatus" TEXT,
    "employer" TEXT,
    "contractType" TEXT,
    "availableCapitalCents" INTEGER,
    "assetsCents" INTEGER,
    "preferredLocations" TEXT,
    "preferredPropertyType" TEXT,
    "investmentGoal" TEXT,
    "timeline" TEXT,
    "maxNegativeCashFlowCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "monthlyNetCents" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    CONSTRAINT "IncomeSource_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "monthlyAmountCents" INTEGER NOT NULL,
    "isLoanPayment" BOOLEAN NOT NULL DEFAULT false,
    "customerId" INTEGER NOT NULL,
    CONSTRAINT "ExpenseItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MISSING',
    "customerId" INTEGER NOT NULL,
    CONSTRAINT "DocumentItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
