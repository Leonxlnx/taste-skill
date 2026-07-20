import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createTasteBlocksServer, loadCatalog } from "./server";

async function main() {
  const server = createTasteBlocksServer(await loadCatalog());
  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  console.error(`Taste Blocks MCP failed to start: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
