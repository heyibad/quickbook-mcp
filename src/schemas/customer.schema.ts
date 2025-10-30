import { z } from "zod";

const phoneSchema = z
  .object({
    FreeFormNumber: z.string().trim().min(1, "PrimaryPhone.FreeFormNumber is required"),
  })
  .strict();

const emailSchema = z
  .object({
    Address: z.string().trim().email("PrimaryEmailAddr.Address must be a valid email address"),
  })
  .strict();

const addressSchema = z
  .object({
    Line1: z.string().trim().min(1).optional(),
    Line2: z.string().trim().min(1).optional(),
    City: z.string().trim().min(1).optional(),
    Country: z.string().trim().min(1).optional(),
    CountrySubDivisionCode: z.string().trim().min(1).optional(),
    PostalCode: z.string().trim().min(1).optional(),
  })
  .strict()
  .partial();

export const customerSchema = z
  .object({
    DisplayName: z.string().trim().min(1, "DisplayName is required"),
    GivenName: z.string().trim().min(1).optional(),
    FamilyName: z.string().trim().min(1).optional(),
    CompanyName: z.string().trim().min(1).optional(),
    PrimaryEmailAddr: emailSchema.optional(),
    PrimaryPhone: phoneSchema.optional(),
    BillAddr: addressSchema.optional(),
    ShipAddr: addressSchema.optional(),
    Notes: z.string().trim().optional(),
  })
  .passthrough();

export type CustomerPayload = z.infer<typeof customerSchema>;
