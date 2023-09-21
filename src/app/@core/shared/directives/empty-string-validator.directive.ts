import { Directive } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";

@Directive({
	selector: "[appEmptyStringValidator]",
	providers: [
		{ provide: NG_VALIDATORS, useExisting: EmptyStringValidatorDirective, multi: true }
	]
})
export class EmptyStringValidatorDirective implements Validator {

	constructor() { }
	validate(control: AbstractControl): ValidationErrors | null {
		const v: any = +control.value;
		return validateControlValue(v);
	}
}



export function emptyStringValidator(control: AbstractControl) {
	const v: any = +control.value;
	return validateControlValue(v);
}


function validateControlValue(value) {
	if (value=="") {
		return { "appEmptyStringValidator": true};// 'requiredValue': v.toString().trim() }
	}
	return null;
}
