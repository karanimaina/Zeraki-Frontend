import {ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, Validators} from "@angular/forms";
import {Directive, Injector, Input, ViewChild} from "@angular/core";

@Directive()
export abstract class ControlValueAccessorConnector implements ControlValueAccessor {
	@ViewChild(FormControlDirective, {static: true}) formControlDirective!: FormControlDirective;

	@Input() formControl!: FormControl;
	@Input() formControlName!: string;

	protected constructor(private injector: Injector) {}

	get hasErrors() {
		return this.control?.touched && this.control.errors;
	}

	get control() {
		return this.formControl || this.controlContainer.control?.get(this.formControlName);
	}

	get controlContainer() {
		return this.injector.get(ControlContainer);
	}

	requiredValidator = Validators.required;

	registerOnTouched(fn: any) {
		this.formControlDirective.valueAccessor?.registerOnTouched(fn);
	}

	registerOnChange(fn: any) {
		this.formControlDirective.valueAccessor?.registerOnChange(fn);
	}

	writeValue(obj: any) {
		this.formControlDirective.valueAccessor?.writeValue(obj);
	}

	setDisabledState(isDisabled: boolean): void {
		this.formControlDirective?.valueAccessor?.setDisabledState?.(isDisabled);
	}
}
