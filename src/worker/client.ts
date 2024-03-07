import { createClient } from 'twrpc'
import type { Router } from './router'

// Create a client instance (pass router type as generic)
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
const workerService = createClient<Router>(worker);

export {
  workerService,
}