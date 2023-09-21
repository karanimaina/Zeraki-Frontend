import {Component, Injector, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR} from "@angular/forms";
import { ControlValueAccessorConnector } from "src/app/@core/models/custom-inputs/control-value-accessor-connector";

@Component({
	selector: "app-textarea",
	templateUrl: "./textarea.component.html",
	styleUrls: ["./textarea.component.scss"],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: TextareaComponent,
			multi: true
		}
	]
})
export class TextareaComponent extends ControlValueAccessorConnector {
	@Input() label!: string;
	@Input() placeholder = "";
	@Input() rows = 3;

	constructor(injector: Injector) {
		super(injector);
	}
}
