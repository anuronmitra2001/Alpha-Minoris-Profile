# Alpha Minoris Customer Profile Prototype

A local customer-profile management prototype built for the Alpha Minoris pre-internship assignment.

The application supports customer onboarding, profile review, financial summaries, document-status tracking, profile completeness, and customer search.

## Features

- Customer dashboard with financial and profile-completeness summaries.
- Search by customer name or exact customer ID.
- Create a new customer profile.
- Store optional co-applicant information.
- View a complete customer profile.
- Edit customer profile information.
- Track document statuses:
  - `MISSING`
  - `REQUESTED`
  - `RECEIVED`
  - `REVIEWED`
- Display monthly income and recurring expenses.
- Calculate disposable monthly amount and cash-flow ratios.
- Identify missing required profile information.
- Persist data locally with SQLite.
- Load two fictional seed customers for demonstration.

## Technology Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Prisma ORM
- SQLite
- Node.js

## Project Structure

```text
alpha-minoris-profile/
├── app/
│   ├── page.tsx
│   └── customers/
│       ├── new/
│       │   └── page.tsx
│       └── [id]/
│           ├── page.tsx
│           └── edit/
│               └── page.tsx
├── generated/
│   └── prisma/              # Generated locally; not committed
├── lib/
│   └── prisma.ts
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.sql
├── public/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Customer dashboard and search |
| `/customers/new` | Create a customer |
| `/customers/[id]` | View a customer profile |
| `/customers/[id]/edit` | Edit profile details and document statuses |

## Data Model

### Customer

Stores personal, employment, financial, investment-preference, and timeline information.

Important fields include:

- Full name
- Email and phone
- Household size
- Optional co-applicant full name
- Preferred language
- Employment status
- Employer and contract type
- Available capital
- Relevant assets
- Preferred locations
- Preferred property types
- Investment goal
- Timeline
- Maximum negative cash flow

### IncomeSource

Stores one or more monthly income records linked to a customer.

### ExpenseItem

Stores recurring monthly expenses linked to a customer. Loan payments are represented by the `IsLoanPayment` field and are included in the recurring-expense total.

### DocumentItem

Stores a document type and its current status for a customer.

## Financial Calculations

The application presents neutral calculations only. It does not provide investment recommendations or suitability advice.

### Household net income

```text
Household net income = sum of all monthly income sources
```

### Recurring expenses

```text
Recurring expenses = sum of all monthly expense items
```

Loan payments are included because they are stored as expense items.

### Disposable monthly amount

```text
Disposable monthly amount = household net income - recurring expenses
```

### Cash-flow limit to income

```text
Cash-flow limit / income =
maximum negative cash flow / household net income × 100
```

The application displays `N/A` when the cash-flow limit is missing or household income is zero.

### Cash-flow limit to disposable amount

```text
Cash-flow limit / disposable =
maximum negative cash flow / disposable monthly amount × 100
```

The application displays `N/A` when the cash-flow limit is missing or the disposable amount is zero or negative.

## Profile Completeness

The profile-completeness percentage is calculated from 16 required fields:

```text
Profile completeness =
completed required fields / total required fields × 100
```

A required item is incomplete when its value is null, undefined, empty, or contains only whitespace.

A customer must also have at least one monthly income source for that requirement to be complete.

The dashboard and profile page also show the names of missing required fields.

## Prerequisites

Install:

- Node.js
- npm
- Git

No external database server is required because SQLite runs locally.

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd alpha-minoris-profile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Copy `.env.example` to `.env`.

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The file should contain:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Validate the Prisma schema

```bash
npx prisma validate
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Apply the database migrations

```bash
npx prisma migrate deploy
```

### 7. Load the fictional seed data

```bash
npx prisma db execute --file prisma/seed.sql
```

### 8. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Windows PowerShell note

When PowerShell blocks `npm` or `npx` scripts, use:

```powershell
npm.cmd install
npx.cmd prisma validate
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npx.cmd prisma db execute --file prisma/seed.sql
npm.cmd run dev
```

## Resetting the Local Database

This deletes all current local data, reapplies the migration history, and reloads the fictional seed data:

```bash
npx prisma migrate reset --force
npx prisma generate
npx prisma db execute --file prisma/seed.sql
```

Use this only for local development.

## Quality Checks

Before submission, run:

```bash
npm run lint
npm run build
```

Then test the following manually:

- Dashboard loads both seed customers
- Search works by name
- Search works by exact customer ID
- Customer creation persists after refresh
- Customer profile pages open
- Profile editing persists after refresh
- Document statuses can be changed
- Financial calculations use the stored income and expense records
- Missing fields and completeness percentages are correct
- Missing or zero values do not crash the page

## AI-Assisted Development

AI-assisted development was used during this project.

### Tools used

- ChatGPT
- Claude

### What it was used for

- Learning Next.js App Router and server-component patterns and coding
- Drafting and reviewing Prisma queries
- Debugging TypeScript, JSX and Prisma migration

### Example of a changed or rejected suggestion

An early search-query suggestion converted every search value with `Number(query)` and included that value in an `ID` filter. A text search such as `Heinrich` therefore produced `NaN` and caused a Prisma validation error.

I changed the implementation so it first checks whether the search input contains a valid positive integer. Numeric input performs an exact customer-ID search, while other input performs a customer-name search. This avoided passing `NaN` to Prisma and matched the intended behaviour.

AI suggested creating the initial seed data through Prisma, but I chose to use SQL because I was more familiar with it and could explain the resulting database operations clearly.

I reviewed and tested the submitted code and remain responsible for its structure, data flow, calculations, and behaviour.

## Current Scope and Limitations

- Local development database only.
- No authentication or authorization.
- No document file uploads.
- Document tracking stores statuses only.
- No added security to it.
- No multi-user access control.
