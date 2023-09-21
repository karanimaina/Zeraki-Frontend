import { Component, forwardRef, Inject, Input, Optional } from "@angular/core";
import { FormControl, AbstractControl } from "@angular/forms";
import { ErrorType } from "src/app/@core/enums/field-errors/field-errors";
import { FieldService } from "../../services/input-field/field.service";
import { SubmitFormComponent } from "../submit-form/submit-form.component";

@Component({
	selector: "app-field-errors",
	templateUrl: "./field-errors.component.html",
	styleUrls: ["./field-errors.component.scss"]
})
export class FieldErrorsComponent {

  /**
   * To display error
   */
  @Input() label!: string;

  /**
   * Form control
   */
  @Input("control") formControl!: FormControl | AbstractControl;

  /**
   * Enum reference
   */
  error = ErrorType;

  constructor(@Optional()
              @Inject(forwardRef(() => SubmitFormComponent))
              private _formComponent: SubmitFormComponent,
              private fieldService: FieldService) {
  }

  /**
   * Returns error string related to error type
   * @param error ErrorType
   * @param replacement array to apply arguments on message variables
   */
  msg(error: ErrorType, replacement: { replace: string, with: any }[] = []): string {
  	// Get message using fieldService out of messages.ts file
  	let message = this.fieldService.get(error);
  	replacement.forEach(r => message = message.replace(r.replace, r.with));
  	return message;
  }

  /**
   * Returns the error inside the form control
   * @param err ErrorType
   * @param key string
   */
  getError(err: ErrorType, key?: string): any {
  	return key ? this.formControl.getError(err)[key] : this.formControl.getError(err);
  }

  /**
   * Checks if form control or ng model a specific error
   * @param err ErrorType
   */
  hasError(err: ErrorType): boolean {
  	return this.formControl.hasError(err);
  }

  /**
   * Show errors for current field
   */
  get showErrors(): boolean {
  	return this.formControl && this.formControl.invalid && this.isSubmitted;
  }

  /**
   * Returns if parent form is submitted
   */
  private get isSubmitted(): boolean {
  	return this._formComponent.formGroup.isSubmitted;
  }
}
