import { Component, Input } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { InputValidationService } from "../../services/input-validation/input-validation.service";

@Component({
	selector: "app-input-error-message",
	templateUrl: "./input-error-message.component.html"
})
export class InputErrorMessageComponent {
	@Input() control!: FormControl;
	@Input() labelText: string | null = null;

	constructor(
		private inputValidationService: InputValidationService,
	) { }

	get errorMessage() {
		for (const propertyName in this.control.errors) {
			// eslint-disable-next-line no-prototype-builtins
			if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
				return this.inputValidationService.getValidatorErrorMessage(this.labelText, propertyName, this.control.errors[propertyName]);
			}

			if (this.control.valueChanges) {
				return this.inputValidationService.showValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
			}
		}
	}

	private getName(control: AbstractControl): string | null {
		const group = <FormGroup>control.parent;
		if (!group) {
			return null;
		}

		let name = "";

		Object.keys(group.controls).forEach(key => {
			const childControl = group.get(key);

			if (childControl !== control) {
				return;
			}

			name += key;
		});

		return name;
	}
}
