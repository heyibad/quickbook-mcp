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
    const config: any = {
        title: toolDefinition.title,
        description: toolDefinition.description,
        inputSchema: toolDefinition.inputSchema,
    };
    
    // Only include outputSchema if it's defined
    if (toolDefinition.outputSchema) {
        config.outputSchema = toolDefinition.outputSchema;
        
        // Wrap the handler to ensure structuredContent is always returned
        const originalHandler = toolDefinition.handler;
        const wrappedHandler = async (params: any) => {
            const result = await originalHandler(params);
            
            // Log for debugging
            console.error(`[${toolDefinition.name}] Handler returned:`, {
                hasStructuredContent: 'structuredContent' in result,
                hasContent: 'content' in result,
                structuredContent: result.structuredContent
            });
            
            // Ensure structuredContent exists when outputSchema is defined
            if (!result.structuredContent) {
                console.error(`[${toolDefinition.name}] WARNING: outputSchema defined but no structuredContent returned!`);
            }
            
            return result;
        };
        
        server.registerTool(
            toolDefinition.name,
            config,
            wrappedHandler as any
        );
    } else {
        server.registerTool(
            toolDefinition.name,
            config,
            toolDefinition.handler as any
        );
    }
}
