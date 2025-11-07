const fs = require("fs");
const path = require("path");

const toolsDir = path.join(__dirname, "src", "tools");
const files = fs.readdirSync(toolsDir).filter((f) => f.endsWith(".tool.ts"));

console.log(`Found ${files.length} tool files to process`);

files.forEach((file) => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Skip files that already have structured content
    if (content.includes("structured:")) {
        console.log(`✓ ${file} - already has structured content`);
        return;
    }

    // Skip files without outputSchema
    if (!content.includes("outputSchema")) {
        console.log(`⊘ ${file} - no outputSchema`);
        return;
    }

    // Pattern 1: Fix error returns without structured
    const errorPattern =
        /return\s*{\s*content:\s*\[\s*{\s*type:\s*"text"\s*as\s*const,\s*text:\s*`Error[^`]*:\s*\$\{response\.error\}`[^}]*}\s*\]\s*,?\s*};/g;
    content = content.replace(errorPattern, (match) => {
        if (match.includes("structured:")) return match;

        const textMatch = match.match(/text:\s*(`[^`]+`)/);
        if (!textMatch) return match;

        return match.replace(
            /}\s*\]\s*,?\s*};/,
            `,\n                    structured: {\n                        success: false,\n                        error: response.error || "Unknown error",\n                    }\n                },\n            ],\n        };`
        );
    });

    // Pattern 2: Fix success returns without structured
    // Look for returns that just have JSON.stringify(response.result) or similar
    const successPattern1 =
        /return\s*{\s*content:\s*\[\s*{\s*type:\s*"text"\s*as\s*const,\s*text:\s*JSON\.stringify\((?:response\.result|vendor|customer|[a-z]+)\)[^}]*}\s*\]\s*,?\s*};/g;
    content = content.replace(successPattern1, (match) => {
        if (match.includes("structured:")) return match;

        const dataVar =
            match.match(/JSON\.stringify\(([\w.]+)\)/)?.[1] ||
            "response.result";

        return match.replace(
            /}\s*\]\s*,?\s*};/,
            `,\n                    structured: {\n                        success: true,\n                        data: ${dataVar},\n                    }\n                },\n            ],\n        };`
        );
    });

    // Pattern 3: Fix returns with multiple text blocks
    const successPattern2 =
        /return\s*{\s*content:\s*\[\s*{\s*type:\s*"text"\s*as\s*const,\s*text:\s*`[^`]+`\s*},\s*{\s*type:\s*"text"\s*as\s*const,\s*text:\s*JSON\.stringify\(response\.result\)[^}]*}\s*\]\s*,?\s*};/g;
    content = content.replace(successPattern2, (match) => {
        if (match.includes("structured:")) return match;

        return `return {
            content: [
                { 
                    type: "text" as const, 
                    text: \`Operation successful: \${JSON.stringify(response.result, null, 2)}\`,
                    structured: {
                        success: true,
                        data: response.result,
                    }
                },
            ],
        };`;
    });

    // Pattern 4: Fix update-customer style with structuredContent (deprecated)
    if (content.includes("structuredContent:")) {
        content = content.replace(/structuredContent:\s*output,/g, "");
        content = content.replace(
            /return\s*{\s*content:\s*\[\s*{\s*type:\s*"text"\s*as\s*const,\s*text:\s*JSON\.stringify\(output,\s*null,\s*2\)[^}]*}\s*\]\s*,\s*isError:\s*true,?\s*};/g,
            `return {
            content: [
                {
                    type: "text" as const,
                    text: \`Error: \${response.error}\`,
                    structured: {
                        success: false,
                        error: response.error || "Unknown error",
                    }
                },
            ],
        };`
        );
        content = content.replace(
            /return\s*{\s*content:\s*\[\s*{\s*type:\s*"text"\s*as\s*const,\s*text:\s*JSON\.stringify\(output,\s*null,\s*2\)[^}]*}\s*\]\s*,?\s*};/g,
            `return {
            content: [
                { 
                    type: "text" as const, 
                    text: \`Operation successful: \${JSON.stringify(response.result, null, 2)}\`,
                    structured: {
                        success: true,
                        data: response.result,
                    }
                },
            ],
        };`
        );
    }

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ ${file} - fixed`);
});

console.log("Done!");
