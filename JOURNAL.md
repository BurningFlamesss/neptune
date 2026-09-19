# Faced Error

LOG /src/env/clientEnv.ts:13:3
 →  Invalid Environment Variable
LOG /src/env/clientEnv.ts:15:4
 →    CLIENT_URL: Invalid input: expected string, received undefined
09:52:33 [vite] Internal server error: socket hang up
      at Socket.socketOnEnd (node:_http_client:542:25)
      at Socket.emit (node:events:519:35)
      at endReadableNT (node:internal/streams/readable:1701:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:90:21)


resolved by AI (Opencode): 	envPrefix: ["VITE_", "CLIENT_"],
