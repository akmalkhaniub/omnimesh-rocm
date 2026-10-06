export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<any> | any;
}

export class MCPServer {
  private tools: Map<string, MCPTool> = new Map();

  constructor(public name: string, public version: string = "1.0.0") {}

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }

  async callTool(name: string, params: any) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found on MCP Server '${this.name}'`);
    }
    return await tool.handler(params);
  }
}
