import { loadEnv } from "../loaders/env-loader.js";
import { validateEnv } from "../validators/inference.js";
import { loadSchema } from "../loaders/config-loader.js";
import { z } from "zod";

export class EnvDeckValidationError extends Error {
  constructor(public errors: z.ZodFormattedError<Record<string, unknown>>) {
    super("❌ Invalid environment variables");
    this.name = "EnvDeckValidationError";
  }
}

type EnvRecord = Record<string, unknown>;
let cachedEnv: EnvRecord | null = null;

export function getEnv(): EnvRecord {
  if (cachedEnv) return cachedEnv;

  const { full, local } = loadEnv();

  const schema = loadSchema(local);

  const result = validateEnv(full, schema);

  if (!result.success) {
    if (process.env.NODE_ENV === "test") {
      throw new EnvDeckValidationError(result.errors);
    }
    console.error("❌ Invalid environment variables\n");
    console.error(JSON.stringify(result.errors, null, 2));
    throw new EnvDeckValidationError(result.errors);
  }

  cachedEnv = Object.freeze(result.data) as EnvRecord;
  return cachedEnv;
}

const proxyTarget = {} as EnvRecord;
let targetInitialized = false;

function initTarget() {
  if (targetInitialized) return;
  const realEnv = getEnv();
  Object.assign(proxyTarget, realEnv);
  Object.freeze(proxyTarget);
  targetInitialized = true;
}

export const env = new Proxy(proxyTarget, {
  get(_, prop) {
    initTarget();
    return Reflect.get(proxyTarget, prop);
  },
  has(_, prop) {
    initTarget();
    return Reflect.has(proxyTarget, prop);
  },
  ownKeys() {
    initTarget();
    return Reflect.ownKeys(proxyTarget);
  },
  getOwnPropertyDescriptor(_, prop) {
    initTarget();
    return Reflect.getOwnPropertyDescriptor(proxyTarget, prop);
  },
  isExtensible() {
    initTarget();
    return Reflect.isExtensible(proxyTarget);
  },
  preventExtensions() {
    initTarget();
    return Reflect.preventExtensions(proxyTarget);
  },
  set() {
    return false;
  },
  deleteProperty() {
    return false;
  }
});

export function createEnv<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

export { z };
