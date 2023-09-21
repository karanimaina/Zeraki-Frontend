import {Component, Injector, Input} from "@angular/core";
import {
	NG_VALUE_ACCESSOR
} from "@angular/forms";
import { ControlValueAccessorConnector } from "src/app/@core/models/custom-inputs/control-value-accessor-connector";
type TextTypes = "text" | "number" | "password" | "email" | "date"

@Component({
	selector: "app-input",
	templateUrl: "./input.component.html",
	styleUrls: ["./input.component.scss"],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: InputComponent,
			multi: true
		}
	]
})
export class InputComponent extends ControlValueAccessorConnector {
	@Input() label!: string;
	@Input() type: TextTypes = "text";
	@Input() placeholder = "";
	@Input() min?: string;
	@Input() max?: string;

	constructor(injector: Injector) {
		super(injector);
	}
}
