import { GetCustomerTool } from "./dist/tools/get-customer.tool.js";

async function testHandler() {
    try {
        // Mock the handler with a test ID
        const result = await GetCustomerTool.handler({ id: "test-123" });
        console.log("Handler result:");
        console.log(JSON.stringify(result, null, 2));
        console.log("\nHas structuredContent:", "structuredContent" in result);
        console.log("structuredContent value:", result.structuredContent);
    } catch (error) {
        console.error("Error:", error.message);
        console.error(error);
    }
}

testHandler();
