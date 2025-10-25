import { validateStep1 } from "../Pages/Registration/Validation/step1Validation";

describe("validateStep1", () => {
  it("fails when required fields missing", () => {
    const r = validateStep1({ firstName: "", lastName: "", contact: "" });
    expect(r.valid).toBe(false);
    expect(r.errors.firstName).toBeDefined();
    expect(r.errors.lastName).toBeDefined();
    expect(r.errors.contact).toBeDefined();
  });

  it("fails for invalid phone format", () => {
    const r = validateStep1({
      firstName: "A",
      lastName: "B",
      contact: "012345",
    });
    expect(r.valid).toBe(false);
    expect(r.errors.contact).toMatch(/start with 07/);
  });

  it("fails for invalid dob format", () => {
    const r = validateStep1({
      firstName: "A",
      lastName: "B",
      contact: "0712345678",
      dob: "01-01-2000",
    });
    expect(r.valid).toBe(false);
    expect(r.errors.dob).toMatch(/YYYY-MM-DD/);
  });

  it("fails for future dob", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const s = tomorrow.toISOString().slice(0, 10);
    const r = validateStep1({
      firstName: "A",
      lastName: "B",
      contact: "0712345678",
      dob: s,
    });
    expect(r.valid).toBe(false);
    expect(r.errors.dob).toMatch(/cannot be in the future/);
  });

  it("passes for valid input", () => {
    const r = validateStep1({
      firstName: "A",
      lastName: "B",
      contact: "0712345678",
      dob: "2000-01-01",
    });
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors).length).toBe(0);
  });
});
