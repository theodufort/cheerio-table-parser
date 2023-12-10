import { findLastContinueIndex, parseIntOrDefault } from "../func";

describe("parseIntOrDefault", () => {
  test("number", () => {
    expect(parseIntOrDefault("1", 0)).toBe(1);
  });

  test("string", () => {
    expect(parseIntOrDefault("", 0)).toBe(0);
    expect(parseIntOrDefault("a", 0)).toBe(0);
  });
});

describe("findLastContinueIndex", () => {
  test("exist", () => {
    expect(findLastContinueIndex([1, 2, 1, 1], v => v === 1)).toBe(2);
  });
  test("not exists", () => {
    expect(findLastContinueIndex([1, 2, 1, 1], v => v === 0)).toBe(-1);
  });
});
