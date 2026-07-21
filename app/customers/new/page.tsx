import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function optionalText(
  formData: FormData,
  fieldName: string
): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue === "" ? null : trimmedValue;
}

function optionalInteger(
  formData: FormData,
  fieldName: string
): number | null {
  const textValue = optionalText(formData, fieldName);

  if (textValue === null) {
    return null;
  }

  const numberValue = Number(textValue);

  return Number.isInteger(numberValue)
    ? numberValue
    : null;
}

export default function NewCustomerPage() {
  /*
   * This function runs on the server when the form is submitted.
   */
  async function createCustomer(formData: FormData) {
    "use server";

    const fullName = String(
      formData.get("FullName") ?? ""
    ).trim();

    if (fullName === "") {
      throw new Error("Full name is required.");
    }

    const monthlyIncome = optionalInteger(
      formData,
      "MonthlyIncome"
    );

    const monthlyExpense = optionalInteger(
      formData,
      "MonthlyExpense"
    );

    const incomeLabel =
      optionalText(formData, "IncomeLabel") ??
      "Primary income";

    const expenseLabel =
      optionalText(formData, "ExpenseLabel") ??
      "Recurring expense";

    const customer = await prisma.customer.create({
      data: {
        FullName: fullName,
        CoApplicantFullName: optionalText(formData,"CoApplicantFullName"),
        Email: optionalText(formData, "Email"),
        Phone: optionalText(formData, "Phone"),
        HouseHoldSize: optionalInteger(
          formData,
          "HouseHoldSize"
        ),
        PreferredLanguage: optionalText(
          formData,
          "PreferredLanguage"
        ),

        EmploymentStatus: optionalText(
          formData,
          "EmploymentStatus"
        ),
        EmployerName: optionalText(
          formData,
          "EmployerName"
        ),
        ContractType: optionalText(
          formData,
          "ContractType"
        ),

        AvailableCapital: optionalInteger(
          formData,
          "AvailableCapital"
        ),
        AvailableAssetsWorth: optionalInteger(
          formData,
          "AvailableAssetsWorth"
        ),
        PreferredLocations: optionalText(
          formData,
          "PreferredLocations"
        ),
        PreferredPropertyTypes: optionalText(
          formData,
          "PreferredPropertyTypes"
        ),
        InvestmentGoal: optionalText(formData, "InvestmentGoal"),
        Timeline: optionalText(formData, "Timeline"),
        MaxNegativeCashFlow: optionalInteger(
          formData,
          "MaxNegativeCashFlow"
        ),

        /*
         * Create an income source only when an amount
         * was entered.
         */
        ...(monthlyIncome !== null
          ? {
              IncomeSources: {
                create: [
                  {
                    Label: incomeLabel,
                    MonthlyIncome: monthlyIncome,
                  },
                ],
              },
            }
          : {}),

        /*
         * Create an expense only when an amount
         * was entered.
         */
        ...(monthlyExpense !== null
          ? {
              ExpenseItems: {
                create: [
                  {
                    Label: expenseLabel,
                    MonthlyExpend: monthlyExpense,
                    IsLoanPayment:
                      formData.get("IsLoanPayment") ===
                      "on",
                  },
                ],
              },
            }
          : {}),

        /*
         * Every new customer starts with a document
         * checklist. Prisma uses the default MISSING status.
         */
        Documents: {
          create: [
            { Type: "ID" },
            { Type: "Salary slips" },
            { Type: "Employment contract" },
            { Type: "Tax assessments" },
            { Type: "SCHUFA" },
            { Type: "Existing-loan documents" },
          ],
        },
      },
    });

    redirect(`/customers/${customer.ID}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Alpha Minoris
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Create customer
          </h1>

          <p className="mt-2 text-gray-600">
            Enter the customer&apos;s profile and financial
            information.
          </p>
        </header>

        <form
          action={createCustomer}
          className="mt-8 space-y-8"
        >
          {/* Personal information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Full name *
                </span>

                <input
                  name="FullName"
                  type="text"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                    Co-applicant full name
                </span>

                <input
                    name="CoApplicantFullName"
                    type="text"
                    placeholder="Optional"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
              
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Email
                </span>

                <input
                  name="Email"
                  type="email"
                  placeholder="customer@example.test"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Phone
                </span>

                <input
                  name="Phone"
                  type="text"
                  placeholder="+49 123 4567890"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Household size
                </span>

                <input
                  name="HouseHoldSize"
                  type="number"
                  min="1"
                  step="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Preferred language
                </span>

                <input
                  name="PreferredLanguage"
                  type="text"
                  placeholder="German, English, French"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

          {/* Employment */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Employment
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Employment status
                </span>

                <input
                  name="EmploymentStatus"
                  type="text"
                  placeholder="Employed,Unemployed"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Employer
                </span>

                <input
                  name="EmployerName"
                  type="text"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Contract type
                </span>

                <input
                  name="ContractType"
                  type="text"
                  placeholder="Full-Time,Part-Time"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

          {/* Investment information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Investment information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Available capital (€)
                </span>

                <input
                  name="AvailableCapital"
                  type="number"
                  min="0"
                  step="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Relevant assets (€)
                </span>

                <input
                  name="AvailableAssetsWorth"
                  type="number"
                  min="0"
                  step="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Preferred locations
                </span>

                <input
                  name="PreferredLocations"
                  type="text"
                  placeholder="Berlin, Hamburg, Munich"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Preferred property types
                </span>

                <input
                  name="PreferredPropertyTypes"
                  type="text"
                  placeholder="Apartment, House"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Investment goal
                </span>

                <input
                  name="InvestmentGoal"
                  type="text"
                  placeholder="Long-term rental income"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Timeline
                </span>

                <input
                  name="Timeline"
                  type="text"
                  placeholder="Within 1 month"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Maximum monthly negative cash flow (€)
                </span>

                <input
                  name="MaxNegativeCashFlow"
                  type="number"
                  min="0"
                  step="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

          {/* Initial financial information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Initial financial information
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Add one income source and one expense now. More
              items can be added later.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Income source
                </span>

                <input
                  name="IncomeLabel"
                  type="text"
                  placeholder="Monthly salary"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Monthly net income (€)
                </span>

                <input
                  name="MonthlyIncome"
                  type="number"
                  min="0"
                  step="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Expense
                </span>

                <input
                  name="ExpenseLabel"
                  type="text"
                  placeholder="Rent"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Monthly expense (€)
                </span>

                <input
                  name="MonthlyExpense"
                  type="number"
                  min="0"
                  step="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  name="IsLoanPayment"
                  type="checkbox"
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-gray-700">
                  This expense is a loan payment
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700"
            >
              Create customer
            </button>

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}