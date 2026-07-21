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