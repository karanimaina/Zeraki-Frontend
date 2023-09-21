import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormGroup, NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-form-mapping-addition",
	templateUrl: "./form-mapping-addition.component.html",
	styleUrls: ["./form-mapping-addition.component.scss"]
})
export class FormMappingAdditionComponent implements OnInit, OnDestroy {
	@Input() educationSystemId?: number;
	@Input() maxClasses = 4;
	@Output() onAdditionSuccess = new EventEmitter<any>();

	readonly APIStatus = APIStatus;
	destroy$ = new Subject<boolean>();

	formMappings: { id: number, formKey: number | null; formValue: string; }[] = [];

	isSubmitted = false;

	get sampleFormMappings(): Array<{id: number; formKey: number; formValue: string;}> {
		const formMappings: any = [];

		for (let i = 0; i < this.maxClasses; i++) {
			const id = i + 1;
			formMappings.push({ id, formKey: id, formValue: id.toString() });
		}

		return formMappings;
	}

	constructor(
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.initializeFormMappings();
	}

	private initializeFormMappings() {
		this.formMappings = [];

		for (const { id, formKey, formValue } of this.sampleFormMappings) {
			this.formMappings.push({ id, formKey, formValue });
		}
	}

	checkInputValidation(form: NgForm, inputName: string) {
		if (form.controls[inputName] && form.controls[inputName].invalid && (this.isSubmitted || form.controls[inputName].dirty || form.controls[inputName].touched)) {
			const { required, min, max } = <any>form.controls[inputName].errors;

			if (required) {
				return this.translate.instant('litemore.managers.educationSystems.components.formMappingAddition.thisFieldIsRequired');
			} else if (min) {
				return this.translate.instant('litemore.managers.educationSystems.components.formMappingAddition.minimumValueIs',{value:min.min});
			} else if (max) {
				return this.translate.instant('litemore.managers.educationSystems.components.formMappingAddition.maximumValueIs',{value:max.max});
			} else {
				return this.translate.instant('litemore.managers.educationSystems.components.formMappingAddition.invalidInput');
			}
		}

		return false;
	}

	addFormMappingItemRow(previousFormKey: number | null) {
		this.isSubmitted = false;

		this.formMappings.push({
			id: Date.now(),
			formKey: previousFormKey ? (previousFormKey + 1) : null,
			formValue: "",
		});
	}

	removeFormMappingItemRow(id: number, ngForm: NgForm) {
		this.formMappings = this.formMappings.filter((formMapping) => formMapping.id !== id);

		const formKeyInputName = "formKey_" + id;
		const formValueInputName = "formValue_" + id;

		const form: FormGroup = ngForm.form;

		form.removeControl(formValueInputName);
		form.removeControl(formKeyInputName);
	}

	isAddingFormMapping = false;

	addFormMapping(form: NgForm) {
		this.isSubmitted = true;

		if (form.invalid) {
			const message = this.translate.instant("litemore.formMapping.toastMessages.addError");
			this.toastService.error(message);

			return;
		}

		this.isAddingFormMapping = true;

		const formMappingsPayload = this.formMappings.map(formMapping => {
			return { formKey: formMapping.formKey, formValue: formMapping.formValue };
		});

		const payload: any = {
			educationSystemId: this.educationSystemId?.toString(),
			formMappings: formMappingsPayload,
		};

		this.litemoreService.addFormMapping(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.responseHandler.success(resp, "addFormMapping()");
				this.onAdditionSuccess.emit();
				this.isAddingFormMapping = false;
			},
			error: (err) => {
				this.isAddingFormMapping = false;
				this.responseHandler.error(err, "addFormMapping()");
			},
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
