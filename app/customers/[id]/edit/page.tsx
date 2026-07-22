import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENT_STATUSES = [
  "MISSING",
  "REQUESTED",
  "RECEIVED",
  "REVIEWED",
] as const;

type DocumentStatusValue =
  (typeof DOCUMENT_STATUSES)[number];

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function isDocumentStatus(
  value: string
): value is DocumentStatusValue {
  return DOCUMENT_STATUSES.includes(
    value as DocumentStatusValue
  );
}

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

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;
  const customerID = Number(id);

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

  async function updateCustomer(formData: FormData) {
    "use server";

    const fullName = String(
      formData.get("FullName") ?? ""
    ).trim();

    if (fullName === "") {
      throw new Error("Full name is required.");
    }

    await prisma.customer.update({
      where: {
        ID: customerID,
      },
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
      },
    });

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}`);
  }

  async function addIncomeSource(formData: FormData) {
    "use server";

    const label = optionalText(formData, "Label");
    const monthlyIncome = optionalInteger(
      formData,
      "MonthlyIncome"
    );

    if (
      label === null ||
      monthlyIncome === null ||
      monthlyIncome < 0
    ) {
      throw new Error(
        "Enter a valid income label and a non-negative whole-number amount."
      );
    }

    await prisma.incomeSource.create({
      data: {
        Label: label,
        MonthlyIncome: monthlyIncome,
        CustomerID: customerID,
      },
    });

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  async function updateIncomeSource(formData: FormData) {
    "use server";

    const incomeID = Number(formData.get("IncomeID"));
    const label = optionalText(formData, "Label");
    const monthlyIncome = optionalInteger(
      formData,
      "MonthlyIncome"
    );

    if (
      !Number.isInteger(incomeID) ||
      label === null ||
      monthlyIncome === null ||
      monthlyIncome < 0
    ) {
      throw new Error("Invalid income update.");
    }

    const result = await prisma.incomeSource.updateMany({
      where: {
        ID: incomeID,
        CustomerID: customerID,
      },
      data: {
        Label: label,
        MonthlyIncome: monthlyIncome,
      },
    });

    if (result.count === 0) {
      throw new Error("Income source was not found.");
    }

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  async function deleteIncomeSource(formData: FormData) {
    "use server";

    const incomeID = Number(formData.get("IncomeID"));

    if (!Number.isInteger(incomeID)) {
      throw new Error("Invalid income source.");
    }

    const result = await prisma.incomeSource.deleteMany({
      where: {
        ID: incomeID,
        CustomerID: customerID,
      },
    });

    if (result.count === 0) {
      throw new Error("Income source was not found.");
    }

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  async function addExpenseItem(formData: FormData) {
    "use server";

    const label = optionalText(formData, "Label");
    const monthlyExpend = optionalInteger(
      formData,
      "MonthlyExpend"
    );
    const isLoanPayment =
      formData.get("IsLoanPayment") === "on";

    if (
      label === null ||
      monthlyExpend === null ||
      monthlyExpend < 0
    ) {
      throw new Error(
        "Enter a valid expense label and a non-negative whole-number amount."
      );
    }

    await prisma.expenseItem.create({
      data: {
        Label: label,
        MonthlyExpend: monthlyExpend,
        IsLoanPayment: isLoanPayment,
        CustomerID: customerID,
      },
    });

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  async function updateExpenseItem(formData: FormData) {
    "use server";

    const expenseID = Number(formData.get("ExpenseID"));
    const label = optionalText(formData, "Label");
    const monthlyExpend = optionalInteger(
      formData,
      "MonthlyExpend"
    );
    const isLoanPayment =
      formData.get("IsLoanPayment") === "on";

    if (
      !Number.isInteger(expenseID) ||
      label === null ||
      monthlyExpend === null ||
      monthlyExpend < 0
    ) {
      throw new Error("Invalid expense update.");
    }

    const result = await prisma.expenseItem.updateMany({
      where: {
        ID: expenseID,
        CustomerID: customerID,
      },
      data: {
        Label: label,
        MonthlyExpend: monthlyExpend,
        IsLoanPayment: isLoanPayment,
      },
    });

    if (result.count === 0) {
      throw new Error("Expense item was not found.");
    }

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  async function deleteExpenseItem(formData: FormData) {
    "use server";

    const expenseID = Number(formData.get("ExpenseID"));

    if (!Number.isInteger(expenseID)) {
      throw new Error("Invalid expense item.");
    }

    const result = await prisma.expenseItem.deleteMany({
      where: {
        ID: expenseID,
        CustomerID: customerID,
      },
    });

    if (result.count === 0) {
      throw new Error("Expense item was not found.");
    }

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  async function updateDocumentStatus(
    formData: FormData
  ) {
    "use server";

    const documentID = Number(
      formData.get("DocumentID")
    );

    const status = String(
      formData.get("Status") ?? ""
    );

    if (
      !Number.isInteger(documentID) ||
      !isDocumentStatus(status)
    ) {
      throw new Error("Invalid document update.");
    }

    await prisma.documentItem.updateMany({
      where: {
        ID: documentID,
        CustomerID: customerID,
      },
      data: {
        Status: status,
      },
    });

    revalidatePath("/");
    revalidatePath(`/customers/${customerID}`);
    revalidatePath(`/customers/${customerID}/edit`);

    redirect(`/customers/${customerID}/edit`);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/customers/${customer.ID}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to customer profile
        </Link>

        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Alpha Minoris
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Edit customer
          </h1>

          <p className="mt-2 text-gray-600">
            Update the profile for {customer.FullName}.
          </p>
        </header>

        <form
          action={updateCustomer}
          className="mt-8 space-y-8"
        >
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
                  defaultValue={customer.FullName}
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
                    defaultValue={customer.CoApplicantFullName ?? ""}
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
                  defaultValue={customer.Email ?? ""}
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
                  defaultValue={customer.Phone ?? ""}
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
                  defaultValue={
                    customer.HouseHoldSize ?? ""
                  }
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
                  defaultValue={
                    customer.PreferredLanguage ?? ""
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

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
                  defaultValue={
                    customer.EmploymentStatus ?? ""
                  }
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
                  defaultValue={
                    customer.EmployerName ?? ""
                  }
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
                  defaultValue={
                    customer.ContractType ?? ""
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

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
                  defaultValue={
                    customer.AvailableCapital ?? ""
                  }
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
                  defaultValue={
                    customer.AvailableAssetsWorth ?? ""
                  }
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
                  defaultValue={
                    customer.PreferredLocations ?? ""
                  }
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
                  defaultValue={
                    customer.PreferredPropertyTypes ?? ""
                  }
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
                  defaultValue={customer.InvestmentGoal ?? ""}
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
                  defaultValue={customer.Timeline ?? ""}
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
                  defaultValue={
                    customer.MaxNegativeCashFlow ?? ""
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700"
            >
              Save changes
            </button>

            <Link
              href={`/customers/${customer.ID}`}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700"
            >
              Cancel
            </Link>
          </div>
        </form>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Income sources
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Add, edit or remove monthly household income.
          </p>

          {customer.IncomeSources.length === 0 ? (
            <p className="mt-5 text-sm text-gray-600">
              No income sources have been added.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {customer.IncomeSources.map((income) => (
                <form
                  key={income.ID}
                  action={updateIncomeSource}
                  className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-[1fr_180px_auto]"
                >
                  <input
                    type="hidden"
                    name="IncomeID"
                    value={income.ID}
                  />

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Income label
                    </span>

                    <input
                      name="Label"
                      type="text"
                      required
                      defaultValue={income.Label}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Monthly income (€)
                    </span>

                    <input
                      name="MonthlyIncome"
                      type="number"
                      min="0"
                      step="1"
                      required
                      defaultValue={income.MonthlyIncome}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </label>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                      Save
                    </button>

                    <button
                      type="submit"
                      formAction={deleteIncomeSource}
                      formNoValidate
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}

          <form
            action={addIncomeSource}
            className="mt-6 grid gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-[1fr_180px_auto]"
          >
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                New income label
              </span>

              <input
                name="Label"
                type="text"
                required
                placeholder="For example: Salary"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Monthly income (€)
              </span>

              <input
                name="MonthlyIncome"
                type="number"
                min="0"
                step="1"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Add income
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Expense items
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Add, edit or remove recurring monthly expenses.
          </p>

          {customer.ExpenseItems.length === 0 ? (
            <p className="mt-5 text-sm text-gray-600">
              No expense items have been added.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {customer.ExpenseItems.map((expense) => (
                <form
                  key={expense.ID}
                  action={updateExpenseItem}
                  className="grid gap-4 rounded-xl border border-gray-200 p-4 lg:grid-cols-[1fr_180px_150px_auto]"
                >
                  <input
                    type="hidden"
                    name="ExpenseID"
                    value={expense.ID}
                  />

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Expense label
                    </span>

                    <input
                      name="Label"
                      type="text"
                      required
                      defaultValue={expense.Label}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Monthly expense (€)
                    </span>

                    <input
                      name="MonthlyExpend"
                      type="number"
                      min="0"
                      step="1"
                      required
                      defaultValue={expense.MonthlyExpend}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </label>

                  <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
                    <input
                      name="IsLoanPayment"
                      type="checkbox"
                      defaultChecked={expense.IsLoanPayment}
                    />
                    Loan payment
                  </label>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                      Save
                    </button>

                    <button
                      type="submit"
                      formAction={deleteExpenseItem}
                      formNoValidate
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}

          <form
            action={addExpenseItem}
            className="mt-6 grid gap-4 rounded-xl bg-gray-50 p-4 lg:grid-cols-[1fr_180px_150px_auto]"
          >
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                New expense label
              </span>

              <input
                name="Label"
                type="text"
                required
                placeholder="For example: Rent"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Monthly expense (€)
              </span>

              <input
                name="MonthlyExpend"
                type="number"
                min="0"
                step="1"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </label>

            <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
              <input
                name="IsLoanPayment"
                type="checkbox"
              />
              Loan payment
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Add expense
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Document checklist
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Update the current status of each required
            document.
          </p>

          {customer.Documents.length === 0 ? (
            <p className="mt-5 text-sm text-red-700">
              No document checklist items were found.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {customer.Documents.map((document) => (
                <form
                  key={document.ID}
                  action={updateDocumentStatus}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <input
                    type="hidden"
                    name="DocumentID"
                    value={document.ID}
                  />

                  <span className="font-medium text-gray-800">
                    {document.Type}
                  </span>

                  <div className="flex items-center gap-3">
                    <select
                      name="Status"
                      defaultValue={document.Status}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    >
                      {DOCUMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Save status
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}