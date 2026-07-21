import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatEuros(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function isCompleted(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

function formatPercentage(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(1)}%`;
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "REVIEWED":
      return "bg-green-100 text-green-800";
    case "RECEIVED":
      return "bg-blue-100 text-blue-800";
    case "REQUESTED":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-red-100 text-red-800";
  }
}

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function Home({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  const rawQuery = Array.isArray(params.q)
  ? params.q[0]
  : params.q;

  const query = rawQuery?.trim() ?? "";

  const isCustomerID = /^[1-9]\d*$/.test(query);

  const customers = await prisma.customer.findMany({
    where:
      query === ""
        ? undefined
        : isCustomerID
          ? {
              ID: Number(query),
            }
          : {
              FullName: {
                contains: query,
              },
            },

    include: {
      IncomeSources: true,
      ExpenseItems: true,
      Documents: true,
    },

    orderBy: {
      ID: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Alpha Minoris
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Customer Dashboard
              </h1>

              <p className="mt-2 text-gray-600">
                Customer profiles, financial snapshots and document progress.
              </p>
            </div>

            <Link
              href="/customers/new"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700"
            >
              Add customer
            </Link>
          </div>

          <form
            action="/"
            method="get"
            className="mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>

            <input
              id="customer-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by customer name or ID"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900"
            />

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700"
            >
              Search
            </button>

            {query !== "" && (
              <Link
                href="/"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-center font-medium text-gray-700"
              >
                Clear
              </Link>
            )}
          </form>
        </header>

        {customers.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-700">
              No customers were found in the database.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {customers.map((customer) => {
              /*
               * Household net income
               * = sum of all monthly income sources
               */
              const totalIncome = customer.IncomeSources.reduce(
                (total, incomeSource) =>
                  total + incomeSource.MonthlyIncome,
                0
              );

              /*
               * Recurring expenses
               * = sum of all monthly expenses
               *
               * Loan payments are included because they are stored
               * as ExpenseItem records.
               */
              const totalExpenses = customer.ExpenseItems.reduce(
                (total, expenseItem) =>
                  total + expenseItem.MonthlyExpend,
                0
              );

              /*
               * Disposable monthly amount
               * = household income - recurring expenses
               */
              const disposableAmount =
                totalIncome - totalExpenses;

              /*
               * A missing cash-flow limit is different from a limit of €0.
               */
              const cashFlowLimit =
                customer.MaxNegativeCashFlow;

              /*
               * Cash-flow limit / income
               *
               * Show N/A when:
               * - the customer has not provided a limit
               * - income is zero
               */
              const cashFlowLimitToIncome =
                cashFlowLimit !== null && totalIncome > 0
                  ? (cashFlowLimit / totalIncome) * 100
                  : null;

              /*
               * Cash-flow limit / disposable amount
               *
               * Show N/A when:
               * - the customer has not provided a limit
               * - disposable income is zero or negative
               */
              const cashFlowLimitToDisposable =
                cashFlowLimit !== null &&
                disposableAmount > 0
                  ? (cashFlowLimit / disposableAmount) * 100
                  : null;

              /*
               * Required profile fields used for completeness.
               *
               * Each field has a readable label so missing fields
               * can be shown to the user.
               */
              const requiredFields = [
                {
                  label: "Full name",
                  completed: isCompleted(customer.FullName),
                },
                {
                  label: "Email",
                  completed: isCompleted(customer.Email),
                },
                {
                  label: "Phone",
                  completed: isCompleted(customer.Phone),
                },
                {
                  label: "Household size",
                  completed: isCompleted(customer.HouseHoldSize),
                },
                {
                  label: "Preferred language",
                  completed: isCompleted(customer.PreferredLanguage),
                },
                {
                  label: "Employment status",
                  completed: isCompleted(customer.EmploymentStatus),
                },
                {
                  label: "Employer",
                  completed: isCompleted(customer.EmployerName),
                },
                {
                  label: "Contract type",
                  completed: isCompleted(customer.ContractType),
                },
                {
                  label: "Available capital",
                  completed: isCompleted(customer.AvailableCapital),
                },
                {
                  label: "Relevant assets",
                  completed: isCompleted(customer.AvailableAssetsWorth),
                },
                {
                  label: "Preferred locations",
                  completed: isCompleted(customer.PreferredLocations),
                },
                {
                  label: "Preferred property types",
                  completed: isCompleted(customer.PreferredPropertyTypes),
                },
                {
                  label: "Investment goal",
                  completed: isCompleted(customer.InvestmentGoal),
                },
                {
                  label: "Timeline",
                  completed: isCompleted(customer.Timeline),
                },
                {
                  label: "Maximum negative cash flow",
                  completed: isCompleted(customer.MaxNegativeCashFlow),
                },
                {
                  label: "At least one monthly income source",
                  completed: customer.IncomeSources.length > 0,
                }
              ];

              const missingItems = requiredFields
                .filter((field) => !field.completed)
                .map((field) => field.label);

              const completedFields =
                requiredFields.length - missingItems.length;

              /*
               * Profile completeness
               * = completed required fields / total required fields
               */
              const profileCompleteness = Math.round(
                (completedFields / requiredFields.length) *
                  100
              );

              /*
               * Received and reviewed documents count as available.
               */
              const completedDocuments =
                customer.Documents.filter(
                  (document) =>
                    document.Status === "RECEIVED" ||
                    document.Status === "REVIEWED"
                ).length;

              return (
                <article
                  key={customer.ID}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {customer.FullName}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Customer #{customer.ID}
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                          {customer.Email ??
                            "Email missing"}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white">
                        {profileCompleteness}% complete
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-1 flex justify-between text-sm text-gray-600">
                        <span>Profile completeness</span>
                        <span>
                          {completedFields}/
                          {requiredFields.length} fields
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gray-900"
                          style={{
                            width: `${profileCompleteness}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Financial snapshot
                    </h3>

                    <dl className="mt-4 space-y-3">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          Household net income
                        </dt>

                        <dd className="font-medium text-gray-900">
                          {formatEuros(totalIncome)}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          Recurring expenses
                        </dt>

                        <dd className="font-medium text-gray-900">
                          {formatEuros(totalExpenses)}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                        <dt className="font-medium text-gray-700">
                          Disposable monthly amount
                        </dt>

                        <dd
                          className={
                            disposableAmount < 0
                              ? "font-semibold text-red-600"
                              : "font-semibold text-gray-900"
                          }
                        >
                          {formatEuros(
                            disposableAmount
                          )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          Stated cash-flow limit
                        </dt>

                        <dd className="font-medium text-gray-900">
                          {cashFlowLimit === null
                            ? "N/A"
                            : formatEuros(
                                cashFlowLimit
                              )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          Cash-flow limit / income
                        </dt>

                        <dd className="font-medium text-gray-900">
                          {formatPercentage(
                            cashFlowLimitToIncome
                          )}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          Cash-flow limit / disposable
                        </dt>

                        <dd className="font-medium text-gray-900">
                          {formatPercentage(
                            cashFlowLimitToDisposable
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <h4 className="font-medium text-gray-900">
                        Formula explanation
                      </h4>

                      <ul className="mt-2 space-y-2 text-sm text-gray-600">
                        <li>
                          Household net income shows the total monthly income received by the household.
                        </li>

                        <li>
                          Recurring expenses show the household's regular monthly costs, including loan payments.
                        </li>

                        <li>
                          Disposable monthly amount shows how much money remains after regular expenses are paid.
                        </li>

                        <li>
                          Cash-flow limit compared with income shows how much of the household's income could be used to cover a monthly property shortfall.
                        </li>

                        <li>
                          Cash-flow limit compared with disposable income shows how much of the money remaining after expenses could be used to cover that shortfall.
                        </li>
                      </ul>
                    </div>

                    <section className="mt-7">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Missing information
                      </h3>

                      {missingItems.length === 0 ? (
                        <p className="mt-2 text-sm text-green-700">
                          No required profile information is
                          missing.
                        </p>
                      ) : (
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {missingItems.map((item) => (
                            <li
                              key={item}
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className="mt-7">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Document checklist
                        </h3>

                        <span className="text-sm text-gray-600">
                          {completedDocuments}/
                          {customer.Documents.length} received
                          or reviewed
                        </span>
                      </div>

                      {customer.Documents.length === 0 ? (
                        <p className="mt-3 text-sm text-red-700">
                          No document checklist items have been
                          added.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {customer.Documents.map(
                            (document) => (
                              <li
                                key={document.ID}
                                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-3 py-3"
                              >
                                <span className="text-sm font-medium text-gray-800">
                                  {document.Type}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                    document.Status
                                  )}`}
                                >
                                  {document.Status}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </section>
                    <Link
                      href={`/customers/${customer.ID}`}
                      className="mt-7 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      View full profile
                  </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}