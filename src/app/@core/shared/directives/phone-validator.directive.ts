import { Directive } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";

@Directive({
	selector: "[appPhoneValidator]",
	providers: [{
		provide: NG_VALIDATORS,
		useExisting: PhoneValidatorDirective,
		multi: true
	}]
})

export class PhoneValidatorDirective implements Validator {

	constructor() { }
	validate(control: AbstractControl): ValidationErrors | null {
		let value = control.value;
		if (typeof control.value == "string") {
			value = +control.value;
		}
		return validateControlValue(value);
	}

}

export function phoneNumberValidator(control: AbstractControl) {
	const value: any = +control.value;
	return validateControlValue(value);
}


function validateControlValue(value) {
	const numberPattern = /^[0-9]*$/;
	if (!numberPattern.test(value)) {
		return { "appPhoneValidator": true };
	}
	return null;
}
