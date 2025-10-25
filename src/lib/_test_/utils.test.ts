import { cn, formatDate, formatTime, validateNIC, generateId } from "../utils";

describe("lib/utils functions", () => {
  it("cn merges classes and returns a string", () => {
    const out = cn("x", { y: true, z: false });
    expect(typeof out).toBe("string");
    expect(out).toContain("x");
    expect(out).toContain("y");
  });

  it("formatDate works with Date and string inputs", () => {
    expect(formatDate(new Date("2020-01-02"))).toMatch(/2020/);
    expect(formatDate("2020-01-02")).toMatch(/2020/);
  });

  it("formatTime formats 24h string to human time", () => {
    const out = formatTime("09:05");
    expect(typeof out).toBe("string");
    expect(out).toMatch(/9:05|09:05/);
  });

  it("validateNIC accepts old and new formats", () => {
    expect(validateNIC("123456789V")).toBe(true);
    expect(validateNIC("200001010123")).toBe(true);
    expect(validateNIC("bad")).toBe(false);
  });

  it("generateId returns distinct strings", () => {
    const a = generateId();
    const b = generateId();
    expect(typeof a).toBe("string");
    expect(a).not.toBe(b);
  });
});
