import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

/**
 * Register a tool with the MCP server using the new registerTool API.
 * This function bridges the custom ToolDefinition type with the SDK's registerTool method.
 */
export function RegisterTool<
    TInput extends z.ZodRawShape,
    TOutput extends z.ZodRawShape,
>(server: McpServer, toolDefinition: ToolDefinition<TInput, TOutput>) {
    server.registerTool(
        toolDefinition.name,
        {
            title: toolDefinition.title,
            description: toolDefinition.description,
            inputSchema: toolDefinition.inputSchema,
            outputSchema: toolDefinition.outputSchema,
        },
        toolDefinition.handler as any
    );
}
