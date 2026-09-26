# Error

LOG /src/env/clientEnv.ts:13:3
 →  Invalid Environment Variable
LOG /src/env/clientEnv.ts:15:4
 →    CLIENT_URL: Invalid input: expected string, received undefined
09:52:33 [vite] Internal server error: socket hang up
      at Socket.socketOnEnd (node:_http_client:542:25)
      at Socket.emit (node:events:519:35)
      at endReadableNT (node:internal/streams/readable:1701:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:90:21)


### resolved by AI (Opencode): envPrefix: ["VITE_", "CLIENT_"],

# Error

npm run db:push

> db:push
> dotenv -e .env.local -- prisma db push

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "neptune", schema "public" at "localhost:5433"

Error: P1001: Can't reach database server at `localhost:5433`

Please make sure your database server is running at `localhost:5433`.

### resolved by AI (Opencode): - "5433:5432"

# Error

Error: Unauthorized
Error: Failed to register the app
Error: Unauthorized - Missing Cookie

### resolved by AI (Opencode): headers: getRequestHeaders(), 

# Error

Rendered fewer hooks than expected. This may be caused by an accidental early return statement.

# Error

The position of select menu being misorientated

### resolved by AI (Opencode):  position = "popper",

# Error

Recall Result
partly resolved
No details returned by the model.

### resolved by AI: if (c.type === "RUN_ERROR" || c.type === "error") {
    const upstreamDetail = c.error?.metadata?.raw || c.error?.message || c.message;
    const providerName = c.error?.metadata?.provider_name;
    throw new Error(
      `OpenRouter Error${providerName ? ` (${providerName})` : ""}: ${
        upstreamDetail || JSON.stringify(c.error || c)
      }`
    );
  }

  type OpenRouterModelId = Parameters<typeof createOpenRouterText>[0];

const FREE_MODEL_FALLBACKS: OpenRouterModelId[] = [
    "qwen/qwen3.8-27b:free" as OpenRouterModelId,
    "nvidia/nemotron-3-super-120b-a12b:free" as OpenRouterModelId,
    "deepseek/deepseek-v4-flash-0731:free" as OpenRouterModelId,
    "openrouter/free" as OpenRouterModelId,
];