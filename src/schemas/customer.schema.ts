import { z } from "zod";

/**
 * Schema for validating customer data before creating/updating in QuickBooks
 * Based on QuickBooks Online API requirements for Customer entity
 */
export const CustomerSchema = z.object({
    DisplayName: z
        .string()
        .min(1, "Display name is required")
        .max(100, "Display name must be 100 characters or less"),
    Title: z.string().max(15, "Title must be 15 characters or less").optional(),
    GivenName: z
        .string()
        .max(25, "Given name must be 25 characters or less")
        .optional(),
    MiddleName: z
        .string()
        .max(25, "Middle name must be 25 characters or less")
        .optional(),
    FamilyName: z
        .string()
        .max(25, "Family name must be 25 characters or less")
        .optional(),
    Suffix: z
        .string()
        .max(10, "Suffix must be 10 characters or less")
        .optional(),
    CompanyName: z
        .string()
        .max(100, "Company name must be 100 characters or less")
        .optional(),
    PrimaryEmailAddr: z
        .object({
            Address: z.string().email("Invalid email address"),
        })
        .optional(),
    PrimaryPhone: z
        .object({
            FreeFormNumber: z
                .string()
                .max(30, "Phone number must be 30 characters or less"),
        })
        .optional(),
    Mobile: z
        .object({
            FreeFormNumber: z
                .string()
                .max(30, "Mobile number must be 30 characters or less"),
        })
        .optional(),
    Fax: z
        .object({
            FreeFormNumber: z
                .string()
                .max(30, "Fax number must be 30 characters or less"),
        })
        .optional(),
    BillAddr: z
        .object({
            Line1: z.string().max(500).optional(),
            Line2: z.string().max(500).optional(),
            Line3: z.string().max(500).optional(),
            Line4: z.string().max(500).optional(),
            Line5: z.string().max(500).optional(),
            City: z.string().max(255).optional(),
            Country: z.string().max(255).optional(),
            CountrySubDivisionCode: z.string().max(255).optional(),
            PostalCode: z.string().max(30).optional(),
        })
        .optional(),
    ShipAddr: z
        .object({
            Line1: z.string().max(500).optional(),
            Line2: z.string().max(500).optional(),
            Line3: z.string().max(500).optional(),
            Line4: z.string().max(500).optional(),
            Line5: z.string().max(500).optional(),
            City: z.string().max(255).optional(),
            Country: z.string().max(255).optional(),
            CountrySubDivisionCode: z.string().max(255).optional(),
            PostalCode: z.string().max(30).optional(),
        })
        .optional(),
    Notes: z.string().max(2000, "Notes must be 2000 characters or less").optional(),
    WebAddr: z
        .object({
            URI: z.string().url("Invalid URL").optional(),
        })
        .optional(),
    Active: z.boolean().optional(),
    Taxable: z.boolean().optional(),
    Balance: z.number().optional(),
    BalanceWithJobs: z.number().optional(),
    CurrencyRef: z
        .object({
            value: z.string(),
            name: z.string().optional(),
        })
        .optional(),
    PreferredDeliveryMethod: z.enum(["Print", "Email"]).optional(),
    ResaleNum: z.string().max(15).optional(),
});

/**
 * Type inference from the schema
 */
export type CustomerInput = z.infer<typeof CustomerSchema>;

/**
 * Validates customer data and returns formatted errors if validation fails
 * @param data The customer data to validate
 * @returns Object with success status and either parsed data or error messages
 */
export function validateCustomerData(data: any): {
    success: boolean;
    data?: CustomerInput;
    errors?: string[];
} {
    const result = CustomerSchema.safeParse(data);

    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }

    // Format Zod errors into user-friendly messages
    const errors = result.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
    });

    return {
        success: false,
        errors,
    };
}
