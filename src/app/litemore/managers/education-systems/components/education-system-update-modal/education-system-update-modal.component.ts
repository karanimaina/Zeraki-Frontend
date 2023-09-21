import { Component, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { Validators, AbstractControl, FormBuilder } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { CountryEducationSystemItem } from "src/app/@core/models/litemore/country-details/education-system";
import { AddEducationSystemPayload, UpdateEducationSystemPayload } from "src/app/@core/models/litemore/education-system/payload";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-education-system-update-modal",
	templateUrl: "./education-system-update-modal.component.html",
	styleUrls: ["./education-system-update-modal.component.scss"]
})
export class EducationSystemUpdateModalComponent implements OnDestroy {
	@Input() isNewRecord = false;
	@Input() educationSystemItem?: CountryEducationSystemItem;
	@Output() onUpdateSuccess = new EventEmitter<{ shouldResetSearchForm: boolean }>();

	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	isUpdatingEducationSystem = false;

	updateForm = this.fb.group({
		name: ["", Validators.required],
		code: ["", Validators.required],
		classLabel: ["", Validators.required],
		maxClassNumber: [null, Validators.required],
	});

	get name(): AbstractControl | null {
		return this.updateForm.get("name");
	}
	get code(): AbstractControl | null {
		return this.updateForm.get("code");
	}
	get classLabel(): AbstractControl | null {
		return this.updateForm.get("classLabel");
	}
	get maxClassNumber(): AbstractControl | null {
		return this.updateForm.get("maxClassNumber");
	}

	requiredValidator = Validators.required;

	get currentCountryId(): number | undefined {
		return this.currentCountryState.getCurrentCountry()?.countryId;
	}

	constructor(
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private fb: FormBuilder,
		private currentCountryState: CurrentCountryState,
	) { }

	get modalUpdateId(): number | undefined {
		return (this.isNewRecord ? 0 : this.educationSystemItem?.educationSystemId);
	}


	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	prefillUpdateForm() {
		this.updateForm.patchValue({
			name: this.educationSystemItem?.name,
			code: this.educationSystemItem?.code,
			classLabel: this.educationSystemItem?.classType,
			maxClassNumber: this.educationSystemItem?.maxClassNumber,
		});
	}

	resetUpdateForm() {
		this.updateForm.reset();
	}

	onUpdateEducationSystemSubmit() {
		this.updateForm.markAllAsTouched();
		if (this.updateForm.invalid) return;

		let payload: AddEducationSystemPayload | UpdateEducationSystemPayload;

		if (this.isNewRecord) {
			payload = {
				countryId: <number>this.currentCountryId,
				name: this.name?.value,
				code: this.code?.value,
				classType: this.classLabel?.value,
				maxClassNumber: this.maxClassNumber?.value,
			};
		} else {
			payload = {
				educationSystemId: <number>this.educationSystemItem?.educationSystemId,
				name: this.name?.value,
				code: this.code?.value,
				classType: this.classLabel?.value,
				maxClassNumber: this.maxClassNumber?.value,
			};
		}

		this.isUpdatingEducationSystem = true;

		this.litemoreService.updateEducationSystem(payload, this.isNewRecord).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.isUpdatingEducationSystem = false;
				this.closeUpdateModal();

				this.onUpdateSuccess.emit({ shouldResetSearchForm: true });
				this.responseHandler.success(res);
			},
			error: (err: any) => {
				this.isUpdatingEducationSystem = false;
				this.responseHandler.error(err, "onUpdateEducationSystemSubmit()");
			},
		});
	}

	closeUpdateModal() {
		const modalCloseBtn = document.getElementById(`btn-education-system-update-modal-${this.modalUpdateId}`);
		modalCloseBtn?.click();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeUpdateModal();
	}

}
