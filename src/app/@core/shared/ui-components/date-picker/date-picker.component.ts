import { Component, Injector, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlValueAccessorConnector } from "src/app/@core/models/custom-inputs/control-value-accessor-connector";

@Component({
	selector: "app-date-picker",
	templateUrl: "./date-picker.component.html",
	styleUrls: ["./date-picker.component.scss"],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: DatePickerComponent,
			multi: true
		}
	]
})
export class DatePickerComponent extends ControlValueAccessorConnector {
	@Input() label!: string;
	@Input() placeholder = "";

	constructor(injector: Injector) {
		super(injector);
	}
}
