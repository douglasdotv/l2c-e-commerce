import { FormControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static notOnlyWhitespace(control: FormControl): ValidationErrors | null {
    if (control.value != null && control.value.trim().length === 0) {
      return { notOnlyWhitespace: true };
    } else {
      return null;
    }
  }

  static luhnCheck(control: FormControl): ValidationErrors | null {
    let value = control.value;
    if (value && typeof value === 'string') {
      let sum = 0;
      let shouldDouble = false;

      for (let i = value.length - 1; i >= 0; --i) {
        let digit = parseInt(value.charAt(i), 10);

        if (shouldDouble) {
          if ((digit *= 2) > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
      }

      if (sum % 10 !== 0) {
        return { luhnCheck: true };
      }
    }

    return null;
  }
}
