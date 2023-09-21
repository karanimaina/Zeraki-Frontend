import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";

@Component({
	selector: "app-add-company-details",
	templateUrl: "./add-company-details.component.html",
	styleUrls: ["./add-company-details.component.scss"]
})
export class AddCompanyDetailsComponent implements OnInit, OnChanges {

	@Input() companyDetails: any;
	@Output() addCompanyDetailsEvt: EventEmitter<any> = new EventEmitter<any>();
	addForm: FormGroup = this.fb.group({
		name: [""],
		address: [""],
		email: [""],
		phone: [""],
		city: [""],
	});

	constructor(private fb: FormBuilder) { }

	ngOnInit(): void {
		this.initForm();
	}

	initForm() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes && changes.companyDetails && this.companyDetails) {
			this.updateFormValue();
		}
	}

	updateFormValue() {
		this.addForm.patchValue({
			name: this.companyDetails?.name,
			address: this.companyDetails?.address,
			email: this.companyDetails?.email,
			phone: this.companyDetails?.phone,
			city: this.companyDetails?.city
		});
	}

	addCompanyDetails() {
		this.addForm.markAllAsTouched();
		let formHasValue = false;
		Object.keys(this.addForm.controls).forEach((key: string) => {
			const control = this.addForm.get(key);
			if (control?.value?.length > 0) {
				formHasValue = true;
			}
		});

		if (formHasValue) {
			this.setRequiredValidator();
			if (this.addForm.invalid) {
				return;
			}
		} else {
			this.removeRequiredValidator();
		}

		const payload = {
			formHasValue: formHasValue,
			data: this.addForm.value
		};
		this.addCompanyDetailsEvt.emit(payload);
	}

	setRequiredValidator() {
		Object.keys(this.addForm.controls).forEach((key: string) => {
			const control = this.addForm.get(key);
			if (!control?.hasValidator(Validators.required)) {
				control?.addValidators([Validators.required, emptyStringValidator]);
				control?.updateValueAndValidity();
			}
		});
	}

	removeRequiredValidator() {
		Object.keys(this.addForm.controls).forEach((key: string) => {
			const control = this.addForm.get(key);
			control?.removeValidators([Validators.required, emptyStringValidator]);
			control?.updateValueAndValidity();
		});
	}

	get f() {
		return this.addForm.controls;
	}
}
