import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class InputValidationService {

	constructor(
		private translate: TranslateService,
	) { }

	getValidatorErrorMessage(labelText: string | null, validatorName: string, validatorValue?: any) {
		const fieldName = labelText ? this.capitalizeFirstLetter(labelText.toLowerCase()) : this.translate.instant("common.thisField");

		const requiredError = this.translate.instant("common.formErrors.namedFieldRequiredError", { fieldName });
		const invalidInputError = this.translate.instant("common.formErrors.invalidInput");
		const invalidEmailError = this.translate.instant("common.formErrors.invalidEmail");
		const minLengthError = this.translate.instant("common.formErrors.minLength", { min: validatorValue.requiredLength });
		const maxLengthError = this.translate.instant("common.formErrors.maxLength", { max: validatorValue.requiredLength });
		const invalidPhoneNumberError = this.translate.instant("common.formErrors.invalidPhoneNumber");
		const emptyStringError = this.translate.instant("common.formErrors.emptyString", { fieldName });
		const minValError = this.translate.instant("common.formErrors.minValue", { min: validatorValue.min });
		const maxValError = this.translate.instant("common.formErrors.maxValue", { max: validatorValue.max });
		const invalidGradeError = this.translate.instant("common.formErrors.invalidGrade");

		const config = {
			required: requiredError,
			pattern: invalidInputError,
			email: invalidEmailError,
			minlength: minLengthError,
			maxlength: maxLengthError,
			appPhoneValidator: invalidPhoneNumberError,
			appEmptyStringValidator: emptyStringError,
			min: minValError,
			max: maxValError,
			invalidGrade: invalidGradeError,
		};

		return config[validatorName];
	}

	showValidatorErrorMessage(validatorName: string, validatorValue: any) {
		const config = {};
		return config[validatorName];
	}

	private capitalizeFirstLetter(value: string) {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}
}
