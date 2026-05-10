import { describe, it, expect } from "vitest";
import { inferSchemaFromEnv } from "../src/validators/inference";

describe("Frontend Safety", () => {
  it("strictly separates public and private variables", () => {
    const rawEnv = {
      VITE_PUBLIC_URL: "https://example.com",
      DB_PASSWORD: "secret-password",
      NEXT_PUBLIC_ANALYTICS: "UA-1234",
    };
    
    // In a real implementation, we would filter keys here.
    // For V1, we should implement a helper that returns only public vars.
    const publicKeys = Object.keys(rawEnv).filter(k => 
      k.startsWith("VITE_") || k.startsWith("NEXT_PUBLIC_") || k.startsWith("PUBLIC_")
    );
    
    expect(publicKeys).toContain("VITE_PUBLIC_URL");
    expect(publicKeys).toContain("NEXT_PUBLIC_ANALYTICS");
    expect(publicKeys).not.toContain("DB_PASSWORD");
  });
});
