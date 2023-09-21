import {Component, Injector, Input} from "@angular/core";
import {ControlValueAccessorConnector} from "../../../models/custom-inputs/control-value-accessor-connector";
import {NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
	selector: "app-checkbox",
	templateUrl: "./checkbox.component.html",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: CheckboxComponent,
			multi: true
		}
	]
})
export class CheckboxComponent extends ControlValueAccessorConnector {
	@Input() label!: string;
	checkboxId = Math.random().toString(36).substring(2);

	constructor(injector: Injector) {
		super(injector);
	}

}
