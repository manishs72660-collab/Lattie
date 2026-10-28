import { assertEnv } from "../src/config/env.js";
import { ensureVectorIndex } from "../src/utils/vectorIndex.js";

assertEnv();
await ensureVectorIndex();
process.exit(0);
