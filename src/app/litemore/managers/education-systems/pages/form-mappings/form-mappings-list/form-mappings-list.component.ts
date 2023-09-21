import { Component, OnInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder, NgForm } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { PageInfo } from "jspdf";
import { Subject } from "rxjs/internal/Subject";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { FormMappingItem } from "src/app/@core/models/litemore/form-mapping/form-mapping";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import FormMappingsState from "src/app/@core/services/litemore/states/form-mappings.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	templateUrl: "./form-mappings-list.component.html",
	styleUrls: ["./form-mappings-list.component.scss"]
})
export class FormMappingsListComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$ = new Subject<boolean>();

	getFormMappingsStatus$ = this.formMappingsState.getFormMappingsStatus$;
	dataSource: MatTableDataSource<FormMappingItem & { [key: string]: any }> = new MatTableDataSource();
	pageInfo?: PageInfo;

	searchForm = this.fb.group({
		searchTerm: [""],
	});
	get searchTerm(): AbstractControl | null {
		return this.searchForm.get("searchTerm");
	}

	educationSystemId?: number;
	educationSystemName?: string;
	maxClasses = 4;

	displayAdditionUI = false;
	isUpdateActive = false;

	isSubmitted = false;

	constructor(
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private fb: FormBuilder,
		private formMappingsState: FormMappingsState,
		private activatedRoute: ActivatedRoute,
	) { }

	ngOnInit(): void {
		this.subscribeToRouteParams();
		this.subscribeToFormMappings();
	}

	private subscribeToRouteParams() {
		this.activatedRoute.params.subscribe(params => {
			this.maxClasses = params.max;
			this.educationSystemId = +params["educationSystemId"];
			this.fetchFormMappings(this.educationSystemId);
		});
	}

	private fetchFormMappings(educationSystemId: number) {
		this.formMappingsState.retrieveFormMappings({
			educationSystemId,
			formValue: this.searchTerm?.value,
		});
	}

	private subscribeToFormMappings() {
		this.formMappingsState.formMappings$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (response) => {
				if (response) {
					this.educationSystemName = response.name;
					this.dataSource = new MatTableDataSource(response.formMappings);
				}
			}
		});
	}

	clearCache() {
		this.litemoreService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.responseHandler.success(resp, "clearCache()");
			},
			error: (err) => this.responseHandler.error(err, "clearCache()"),
		});
	}

	handleOnAdditionSuccess() {
		this.formMappingsState.retrieveFormMappings({ educationSystemId: this.educationSystemId });
		this.hideFormMappingsAdditionUI();
	}

	checkInputValidation(form: NgForm, inputName: string) {
		if (form.controls[inputName] && form.controls[inputName].invalid && (this.isSubmitted || form.controls[inputName].dirty || form.controls[inputName].touched)) {
			const { required, min, max } = <any>form.controls[inputName].errors;

			if (required) {
				return this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.thisFieldIsRequired');
			} else if (min) {
				return this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.minimumValueIs',{value:min.min})
			} else if (max) {
				return this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.maximumValueIs',{value:max.max})
			} else {
				return this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.invalidInput')
			}
		}

		return false;
	}

	isUpdatingFormMapping = false;

	updateFormMapping(form: NgForm) {
		this.isSubmitted = true;

		if (form.invalid) {
			const message = this.translate.instant("litemore.formMapping.toastMessages.addError");
			this.toastService.error(message);

			return;
		}

		this.isUpdatingFormMapping = true;

		const formMappingsPayload = this.dataSource.filteredData.map(formMappingItem => {
			return {
				formMappingId: formMappingItem.formMappingId,
				formKey: formMappingItem.formKey,
				formValue: formMappingItem.formValue,
			};
		});

		const payload: any = {
			educationSystemId: this.educationSystemId?.toString(),
			formMappings: formMappingsPayload,
		};

		this.litemoreService.updateFormMapping(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.responseHandler.success(resp, "updateFormMapping()");

				this.dataSource = new MatTableDataSource(formMappingsPayload);
				this.setIsUpdateActive(false);
				this.isUpdatingFormMapping = false;
			},
			error: (err) => {
				this.isUpdatingFormMapping = false;
				this.responseHandler.error(err, "updateFormMapping()");
			},
		});
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		this.fetchFormMappings(<number>this.educationSystemId);
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.fetchFormMappings(<number>this.educationSystemId);
	}

	async confirmFormMappingDeletion() {
		const title = this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.deleteFormMapping.title')
		const text =this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.deleteFormMapping.text',{educationSystemName:this.educationSystemName})

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.deleteFormMapping.yes'),
			cancelButtonText: this.translate.instant('litemore.managers.educationSystems.pages.formMappings.formMappingsList.deleteFormMapping.no'),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false,
		});

		if (result.isConfirmed) {
			this.deleteFormMappings(<number>this.educationSystemId);
		}
	}

	isDeletingFormMapping = false;

	private deleteFormMappings(educationSystemId: number) {
		this.isDeletingFormMapping = true;

		this.litemoreService.deleteFormMapping(educationSystemId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.isDeletingFormMapping = false;
				this.responseHandler.success(resp, "deleteFormMappings()");
				this.clearFormMappings();
			},
			error: (err) => {
				this.isDeletingFormMapping = false;
				this.responseHandler.error(err, "deleteFormMappings()");
			},
		});
	}

	private clearFormMappings() {
		this.dataSource = new MatTableDataSource();
	}

	showFormMappingsAdditionUI() {
		this.displayAdditionUI = true;
	}

	hideFormMappingsAdditionUI() {
		this.displayAdditionUI = false;
	}

	get isEmptyResults(): boolean {
		return this.dataSource?.filteredData?.length === 0;
	}

	setIsUpdateActive(value: boolean) {
		this.isUpdateActive = value;
	}

	resetFormMappingItem() {
		const hasEditableFIelds = this.dataSource.filteredData.some((formMappingItem) => formMappingItem["update"]);
		if (!hasEditableFIelds)	this.setIsUpdateActive(false);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
