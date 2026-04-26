import { describe, expect, it, vi } from "vitest";
import { newPlayerId } from "./playerId";

describe("newPlayerId", () => {
  it("returns a UUID-shaped string when randomUUID exists", () => {
    const id = newPlayerId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("falls back when randomUUID is missing", () => {
    const orig = globalThis.crypto;
    vi.stubGlobal("crypto", { randomUUID: undefined });
    try {
      const id = newPlayerId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    } finally {
      vi.stubGlobal("crypto", orig);
    }
  });
});
