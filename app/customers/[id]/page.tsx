import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatEuros(amount: number | null): string {
  if (amount === null) {
    return "Not provided";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatText(value: string | null): string {
  return value ?? "Not provided";
}

function formatNumber(value: number | null): string {
  return value === null ? "Not provided" : String(value);
}

function formatPercentage(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(1)}%`;
}

function isCompleted(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
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

export default async function CustomerPage({
  params,
}: CustomerPageProps) {
  const { id } = await params;
  const customerID = Number(id);

  // Reject invalid route values such as /customers/abc.
  if (!Number.isInteger(customerID)) {
    notFound();
  }

  const customer = await prisma.customer.findUnique({
    where: {
      ID: customerID,
    },

    include: {
      IncomeSources: true,
      ExpenseItems: true,
      Documents: true,
    },
  });

  if (!customer) {
    notFound();
  }

  /*
   * Required financial calculations
   */

  const totalIncome = customer.IncomeSources.reduce(
    (total, income) => total + income.MonthlyIncome,
    0
  );

  const totalExpenses = customer.ExpenseItems.reduce(
    (total, expense) => total + expense.MonthlyExpend,
    0
  );

  const disposableAmount = totalIncome - totalExpenses;

  const cashFlowLimit = customer.MaxNegativeCashFlow;

  const cashFlowLimitToIncome =
    cashFlowLimit !== null && totalIncome > 0
      ? (cashFlowLimit / totalIncome) * 100
      : null;

  const cashFlowLimitToDisposable =
    cashFlowLimit !== null && disposableAmount > 0
      ? (cashFlowLimit / disposableAmount) * 100
      : null;

  /*
   * Completeness calculation
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
    },
];

  const missingItems = requiredFields
    .filter((field) => !field.completed)
    .map((field) => field.label);

  const completedFields =
    requiredFields.length - missingItems.length;

  const completeness = Math.round(
    (completedFields / requiredFields.length) * 100
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
    <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-black"
        >
        ← Back to dashboard
        </Link>

        <Link
                href={`/customers/${customer.ID}/edit`}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
            Edit customer
        </Link>
        </div>

        <header className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Customer #{customer.ID}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {customer.FullName}
              </h1>

              <p className="mt-2 text-gray-600">
                {customer.Email ?? "Email missing"}
              </p>
            </div>

            <span className="w-fit rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">
              {completeness}% complete
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Profile completeness</span>

              <span>
                {completedFields}/{requiredFields.length} fields
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gray-900"
                style={{
                  width: `${completeness}%`,
                }}
              />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal information
            </h2>

            <dl className="mt-4 space-y-3">
              <InformationRow
                label="Full name"
                value={customer.FullName}
              />

              <InformationRow
                label="Email"
                value={formatText(customer.Email)}
              />

              <InformationRow
                label="Phone"
                value={formatText(customer.Phone)}
              />

              <InformationRow
                label="Co-applicant"
                value={formatText(customer.CoApplicantFullName)}
              />

              <InformationRow
                label="Household size"
                value={formatNumber(customer.HouseHoldSize)}
              />

              <InformationRow
                label="Preferred language"
                value={formatText(customer.PreferredLanguage)}
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Employment
            </h2>

            <dl className="mt-4 space-y-3">
              <InformationRow
                label="Employment status"
                value={formatText(customer.EmploymentStatus)}
              />

              <InformationRow
                label="Employer"
                value={formatText(customer.EmployerName)}
              />

              <InformationRow
                label="Contract type"
                value={formatText(customer.ContractType)}
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Investment information
            </h2>

            <dl className="mt-4 space-y-3">
              <InformationRow
                label="Available capital"
                value={formatEuros(customer.AvailableCapital)}
              />

              <InformationRow
                label="Relevant assets"
                value={formatEuros(customer.AvailableAssetsWorth)}
              />

              <InformationRow
                label="Preferred locations"
                value={formatText(customer.PreferredLocations)}
              />

              <InformationRow
                label="Property types"
                value={formatText(customer.PreferredPropertyTypes)}
              />

              <InformationRow
                label="Investment goal"
                value={formatText(customer.InvestmentGoal)}
              />

              <InformationRow
                label="Timeline"
                value={formatText(customer.Timeline)}
              />

              <InformationRow
                label="Maximum negative cash flow"
                value={formatEuros(
                  customer.MaxNegativeCashFlow
                )}
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Financial snapshot
            </h2>

            <dl className="mt-4 space-y-3">
              <InformationRow
                label="Household net income"
                value={formatEuros(totalIncome)}
              />

              <InformationRow
                label="Recurring expenses"
                value={formatEuros(totalExpenses)}
              />

              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                <dt className="font-medium text-gray-700">
                  Disposable monthly amount
                </dt>

                <dd
                  className={
                    disposableAmount < 0
                      ? "text-right font-semibold text-red-600"
                      : "text-right font-semibold text-gray-900"
                  }
                >
                  {formatEuros(disposableAmount)}
                </dd>
              </div>

              <InformationRow
                label="Cash-flow limit / income"
                value={formatPercentage(
                  cashFlowLimitToIncome
                )}
              />

              <InformationRow
                label="Cash-flow limit / disposable"
                value={formatPercentage(
                  cashFlowLimitToDisposable
                )}
              />
            </dl>
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Income sources
          </h2>

          {customer.IncomeSources.length === 0 ? (
            <p className="mt-4 text-red-700">
              No income sources have been recorded.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 text-right font-medium">
                      Monthly income
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customer.IncomeSources.map((income) => (
                    <tr
                      key={income.ID}
                      className="border-b border-gray-100"
                    >
                      <td className="py-3">{income.Label}</td>

                      <td className="py-3 text-right font-medium">
                        {formatEuros(income.MonthlyIncome)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Recurring expenses
          </h2>

          {customer.ExpenseItems.length === 0 ? (
            <p className="mt-4 text-red-700">
              No recurring expenses have been recorded.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Expense</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 text-right font-medium">
                      Monthly amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customer.ExpenseItems.map((expense) => (
                    <tr
                      key={expense.ID}
                      className="border-b border-gray-100"
                    >
                      <td className="py-3">{expense.Label}</td>

                      <td className="py-3 text-gray-600">
                        {expense.IsLoanPayment
                          ? "Loan payment"
                          : "Recurring expense"}
                      </td>

                      <td className="py-3 text-right font-medium">
                        {formatEuros(expense.MonthlyExpend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Missing required information
          </h2>

          {missingItems.length === 0 ? (
            <p className="mt-4 text-green-700">
              No required profile information is missing.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
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

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Document checklist
          </h2>

          {customer.Documents.length === 0 ? (
            <p className="mt-4 text-red-700">
              No document checklist items have been added.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {customer.Documents.map((document) => (
                <li
                  key={document.ID}
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <span className="font-medium text-gray-800">
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
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

type InformationRowProps = {
  label: string;
  value: string;
};

function InformationRow({
  label,
  value,
}: InformationRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-600">{label}</dt>

      <dd className="text-right font-medium text-gray-900">
        {value}
      </dd>
    </div>
  );
}