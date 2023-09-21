import { Component, Injector, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { CompareWithFn } from "@ng-select/ng-select/lib/ng-select.component";
import { ControlValueAccessorConnector } from "src/app/@core/models/custom-inputs/control-value-accessor-connector";

@Component({
	selector: "app-ng-select",
	templateUrl: "./ng-select.component.html",
	styleUrls: ["./ng-select.component.scss"],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: NgSelectComponent,
			multi: true
		}
	]
})
export class NgSelectComponent extends ControlValueAccessorConnector {
	@Input() label!: string;
	@Input() placeholder!: string;
	@Input() items: any;
	@Input() bindLabel!: string;
	@Input() bindValue!: string;
	@Input() clearable = true;
	@Input() multiple = false;
	@Input() searchable = true;
	@Input() virtualScroll = false;
	@Input() closeOnSelect = false;
	@Input() groupBy!: string;
	@Input() selectableGroup = false;
	@Input() selectOnTab = false;
	@Input() hideSelected = false;
	@Input() loading = false;
	@Input() loadingText = "";

	@Input() compareWith: CompareWithFn = (a: any, b: any) => a === b;

	constructor(injector: Injector) {
		super(injector);
	}

	writeValue(obj: any) {
		if (this.items?.length) {
			setTimeout(() => {
				super.writeValue(obj);
			}, 0);
		}
	}
}
