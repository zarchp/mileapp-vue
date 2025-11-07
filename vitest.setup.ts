import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/dom";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
