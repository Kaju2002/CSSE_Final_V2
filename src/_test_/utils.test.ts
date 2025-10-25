import {
  cn,
  formatDate,
  formatTime,
  validateNIC,
  generateId,
} from "../lib/utils";

describe("utils functions", () => {
  it("cn should merge class names", () => {
    const res = cn("a", { b: true, c: false });
    expect(typeof res).toBe("string");
    expect(res).toContain("a");
    expect(res).toContain("b");
  });

  it("formatDate should format a date string", () => {
    const out = formatDate(new Date("2020-01-02"));
    // en-US long format for 2020-01-02 is January 2, 2020
    expect(out).toMatch(/January\s+2,\s+2020/);
  });

  it("formatTime should format HH:MM into human time", () => {
    const t = formatTime("13:05");
    expect(t).toMatch(/1:05/); // should contain 1:05
    expect(t).toMatch(/PM|pm/);
  });

  it("validateNIC recognizes old and new formats", () => {
    expect(validateNIC("123456789V")).toBe(true);
    expect(validateNIC("200001010123")).toBe(true);
    expect(validateNIC("invalid")).toBe(false);
  });

  it("generateId returns unique non-empty strings", () => {
    const a = generateId();
    const b = generateId();
    expect(typeof a).toBe("string");
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });
});
