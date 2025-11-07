#!/usr/bin/env node
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    customer: z.any().optional().describe("The customer object"),
    error: z.string().optional().describe("Error message if operation failed"),
};

console.log("Zod Schema Object:");
console.log(JSON.stringify(outputSchema, null, 2));

console.log("\n\nConverted to JSON Schema:");
const jsonSchema = zodToJsonSchema(z.object(outputSchema));
console.log(JSON.stringify(jsonSchema, null, 2));
