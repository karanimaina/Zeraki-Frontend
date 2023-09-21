import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";

@Component({
	selector: "app-add-country",
	templateUrl: "./add-country.component.html",
	styleUrls: ["./add-country.component.scss"]
})
export class AddCountryComponent implements OnInit,OnChanges {

	@Input() countryDivisions$!:Observable<any>;
	@Input() getCountryDivisionsStatus$!:Observable<any>;
	@Input() country:any = {};
	@Input() APIStatus;
	@Output() addCountryEvt:EventEmitter<any> = new EventEmitter<any>();

	additionForm:FormGroup = this.fb.group({
		name: ["", [Validators.required, emptyStringValidator]],
		countryCode: ["", [Validators.required, emptyStringValidator]],
		division: ["", [Validators.required, emptyStringValidator]],
	});

	get name(): AbstractControl | null {
		return this.additionForm.get("name");
	}
	get countryCode(): AbstractControl | null {
		return this.additionForm.get("countryCode");
	}
	get division(): AbstractControl | null {
		return this.additionForm.get("division");
	}

	constructor(private fb:FormBuilder) { }

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges) {
		if(changes && changes.country) {
			this.updateFormValues();
		}
	}


	updateFormValues() {
		this.additionForm.patchValue({
			name:this.country?.name,
			countryCode:this.country?.countryCode,
			division:this.country?.division
		});
	}

	onAddCountrySubmit() {
		this.additionForm.markAllAsTouched();
		if (this.additionForm.invalid) return;

		const payload:any = {
			name: this.name?.value,
			countryCode: this.countryCode?.value,
			division: this.division?.value,
		};

		this.addCountryEvt.emit(payload);
	}
}

