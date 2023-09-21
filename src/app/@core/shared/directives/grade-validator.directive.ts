import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from "@angular/forms";
import {Directive} from "@angular/core";

@Directive({
	selector: "[gradeValidator]",
	providers: [{
		provide: NG_VALIDATORS,
		useExisting: GradeValidatorDirective,
		multi: true
	}]
})
export class GradeValidatorDirective implements Validator {
	validate(control: AbstractControl): ValidationErrors | null {
		return validateControlValue(control.value);
	}
}

export function gradeValidator(control: AbstractControl): ValidationErrors | null {
	return validateControlValue(control.value);
}

function validateControlValue(value: any): ValidationErrors | null {
	function isLetter(s: string) {
		return s.match(/[a-z]/i);
	}

	function isPlusOrMinusOrAsterisks(s: string) {
		return !s || s.match(/[+*-]/);
	}

	if (value && value.length > 0 && value.length < 3 && isLetter(value.charAt(0)) && isPlusOrMinusOrAsterisks(value.charAt(1))) {
		return null;
	} else {
		return { invalidGrade: true };
	}
}

export function gradeAlphaNumbericValidator(control: AbstractControl): ValidationErrors | null {
	function isAlphaNumberic(value: string) {
		return value.match(/^[A-Za-z0-9]+$/i);
	}

	const value = control.value;

	if (value && isAlphaNumberic(value)) {
		return null;
	}

	return { invalidGrade: true };
}
