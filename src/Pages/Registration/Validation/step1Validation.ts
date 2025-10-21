export type Step1Form = {
  firstName: string;
  lastName: string;
  contact: string;
  dob?: string;
  gender?: string;
  address?: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

function isValidDateString(s: string) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

export function validateStep1(form: Step1Form): ValidationResult {
  const errors: Record<string, string> = {};

  if (!form.firstName || !form.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!form.lastName || !form.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  

  if (!form.contact || !form.contact.trim()) {
    errors.contact = "Contact number is required";
  } else {
    const phone = form.contact.trim();
    // Sri Lankan mobile numbers commonly start with 07 and have 10 digits
    const slPhoneRegex = /^07[0-9]{8}$/;
    if (!slPhoneRegex.test(phone)) {
      errors.contact = "Contact must start with 07 and be 10 digits";
    }
  }

  if (form.dob && form.dob.trim()) {
    const s = form.dob.trim();
    if (!isValidDateString(s)) {
      errors.dob = "Date of birth must be YYYY-MM-DD";
    } else {
      const d = new Date(s);
      const today = new Date();
      // zero time for comparison
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (d > today) {
        errors.dob = "Date of birth cannot be in the future";
      }
    }
  }

  // gender is optional here; normalize if needed

  return { valid: Object.keys(errors).length === 0, errors };
}

export default { validateStep1 };
