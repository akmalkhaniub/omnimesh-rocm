import { test } from "node:test";
import assert from "node:assert";
import { createDefaultMesh, MCPServer, ROCmEngine } from "../src/index";

test("MCPServer tool registration and invocation", async () => {
  const server = new MCPServer("Test-Server");
  server.registerTool({
    name: "add",
    description: "Adds numbers",
    inputSchema: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } } },
    handler: ({ a, b }) => a + b
  });

  const tools = server.listTools();
  assert.strictEqual(tools.length, 1);
  assert.strictEqual(tools[0].name, "add");

  const result = await server.callTool("add", { a: 10, b: 32 });
  assert.strictEqual(result, 42);
});

test("ROCmEngine benchmark simulation returns valid metrics", () => {
  const bench = ROCmEngine.simulateBenchmark();
  assert.strictEqual(bench.hardware, "AMD Instinct MI300X");
  assert.ok(bench.tokensPerSecond > 200);
  assert.strictEqual(bench.quantization, "FP8");
});

test("OmniMeshAgent end-to-end task execution", async () => {
  const { agent } = createDefaultMesh();
  const trace = await agent.executeTask({
    id: "unit-task-101",
    prompt: "Execute high-throughput verification",
    targetArchitecture: "rocm"
  });

  assert.strictEqual(trace.taskId, "unit-task-101");
  assert.strictEqual(trace.verified, true);
  assert.strictEqual(trace.toolsInvoked.length, 2);
  assert.ok(trace.telemetry.tokensPerSecond > 0);
});
