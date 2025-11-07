#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
    name: "test-server",
    version: "1.0.0",
});

// Test tool similar to our get_customer
server.registerTool(
    "test_customer",
    {
        title: "Test Customer",
        description: "Test tool with output schema",
        inputSchema: { id: z.string() },
        outputSchema: {
            success: z.boolean(),
            customer: z.any().optional(),
            error: z.string().optional(),
        },
    },
    async ({ id }) => {
        const output = {
            success: true,
            customer: { id, name: "Test" },
        };

        console.log("Handler returning:", JSON.stringify(output, null, 2));

        return {
            content: [{ type: "text", text: JSON.stringify(output) }],
            structuredContent: output,
        };
    }
);

console.log("Test tool registered successfully");
console.log(
    "Tool has output schema:",
    server._tools?.get?.("test_customer")?._config?.outputSchema ? "YES" : "NO"
);
