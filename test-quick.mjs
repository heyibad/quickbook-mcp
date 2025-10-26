#!/usr/bin/env node

/**
 * Quick test script - Tests a single tool quickly
 * Usage: node test-quick.mjs [tool-name] [args-json]
 * Example: node test-quick.mjs get-bill '{"id":"1"}'
 */

const SERVER_URL = "http://localhost:3000/mcp";
const ACCESS_TOKEN =
    "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..PNxGRe75NLP87qcY-HdHIw.m5l7uQXwccYaY4vBFWHakz-_w6BcIkI0E0l4lsmhNMHdyJV45zDXaoHorNBJwBp53bOdTC1oFnn9V7hnIZsTfddcN-8ZStvJniB_viSdK08nVxkLS_gKrX13ra8ptQxMPiFKr7DAWqnTed6NaWxtaqUR6eplx8vxX9xuCWDa_KNIAWYPZurxB_HRe28Ym-ATQ58BtXLYH-97jeg_9hSjD4AFBRUjUrPKtmmTOtHnG3by2YaDtSrrkOUZNdR3dkhXYUBgnLNBMMLRY_cUJXRCI5RSwwo8NAHybTQCrGcRRepPsXnJYTvQvwBxWoW8pnAgsSLdDgDpPDVzh3vyqdIWZ8a6FKcp_YVuYgHhGKucRC_Jlpa54iBGvmUPwyrFNF4cmkJSjnK4hSV_KS4pvMUhuKQ68qi8eFkaaf3ZOZql0aMFRI_sBQeo3D1z_X-Me2tcDvYLFwqIGuGbq8HSlDnkwFw1fqM0xnU4hcCNyXP8nsQ.j_Kv-NDui1Lpbedk6L32mg";

const toolName = process.argv[2] || "get-bill";
const argsJson = process.argv[3] || '{"id":"1"}';

/**
 * Parse Server-Sent Events (SSE) response to JSON
 */
function parseSSE(text) {
    const lines = text.split("\n");
    let result = "";

    for (const line of lines) {
        if (line.startsWith("data: ")) {
            result += line.substring(6);
        }
    }

    return result ? JSON.parse(result) : null;
}

async function testTool() {
    console.log(`\nTesting tool: ${toolName}`);
    console.log(`Arguments: ${argsJson}\n`);

    try {
        const args = JSON.parse(argsJson);

        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                Accept: "application/json, text/event-stream",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/call",
                params: {
                    name: toolName,
                    arguments: args,
                },
            }),
        });

        const text = await response.text();
        const data = parseSSE(text);

        console.log("Response:");
        console.log(JSON.stringify(data, null, 2));
        console.log("");
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

testTool();
