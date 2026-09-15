import { describe, expect, it } from "vitest";

import { slugifyName } from "@/lib/slug";

describe("slugifyName", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugifyName("Moon Pigeon")).toBe("moon-pigeon");
  });

  it("collapses repeated punctuation into one hyphen", () => {
    expect(slugifyName("Moon --- Pigeon!!")).toBe("moon-pigeon");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyName("  $Gate Token  ")).toBe("gate-token");
  });

  it("returns an empty string for input with no alphanumerics", () => {
    expect(slugifyName("!!!")).toBe("");
  });
});
