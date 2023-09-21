import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";

@Component({
	selector: "app-add-payment-details",
	templateUrl: "./add-payment-details.component.html",
	styleUrls: ["./add-payment-details.component.scss"]
})
export class AddPaymentDetailsComponent implements OnInit, OnChanges {

	addForm:FormGroup = this.formBuilder.group({
		accountName:[""],
		accountNumber:[""],
		bankName:[""],
		currency:[""],
		vatRate:[""],
		taxPinTitle:[""],
		taxPin:[""],
	});

	@Input() paymentInformation:any;
	@Input() isAddingCountry = false;
	@Output() paymentDetailsEvt:EventEmitter<any> = new EventEmitter<any>();

	constructor(private formBuilder:FormBuilder) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges) {
		if(changes && changes.paymentInformation) {
			console.log(this.paymentInformation);
			this.updateFormValues();
		}
	}

	updateFormValues() {
		this.addForm.patchValue({
			accountName:this.paymentInformation?.accountName,
			accountNumber:this.paymentInformation?.accountNumber,
			bankName:this.paymentInformation?.bankName,
			currency:this.paymentInformation?.currency,
			vatRate:this.paymentInformation?.vatRate,
			taxPinTitle:this.paymentInformation?.taxPinTitle,
			taxPin:this.paymentInformation?.taxPin,
		});
	}


	addCompanyDetails() {
		let formHasValue = false;
		Object.keys(this.addForm.controls).forEach((key: string) => {
			const control = this.addForm.get(key);
			if(control?.value?.length>0) {
				formHasValue = true;
			}
		});

		if(formHasValue) {
			this.setRequiredValidator();
			if(this.addForm.invalid) {
				return;
			}
		}

		const payload = {
			formHasValue:formHasValue,
			data:this.addForm.value
		};
		this.paymentDetailsEvt.emit(payload);
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
