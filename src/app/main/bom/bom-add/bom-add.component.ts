import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { BomPaService } from "src/app/@core/services/bom/bom-pa.service";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import { ExcelTemplateHeader } from "../../../@core/models/excel/excel-template-header";

@Component({
	selector: "app-bom-add",
	templateUrl: "./bom-add.component.html",
	styleUrls: ["./bom-add.component.scss"]
})
export class BomAddComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	officialDetailOption = true;
	officialGroups!: any[];

	// add via keying in
	formDetails!: FormGroup;
	formDetailsSubmit = false;

	// add via spreadsheet
	uploadBomForm!: FormGroup;
	uploadBomFormSubmit = false;

	uploadedBom: any[] | null = null;

	textTscNo: any = "";

	constructor(
		private summaryService: SummaryService,
		private bomService: BomPaService,
		private dataService: DataService,
		private fb: FormBuilder,
		private router: Router,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.initForm();
		this.loadBomPaGroups();
		this.loadSchoolTypeData();
	}

	initForm() {
		this.formDetails = this.fb.group({
			NAME: ["", [Validators.required, emptyStringValidator]],
			TITLE: ["", [Validators.required, emptyStringValidator]],
			PHONE: [null],
			GROUP: [null],
			ADDRESS: [""],
			NATIONAL_ID_NO: [null]
		});

		this.uploadBomForm = this.fb.group({
			file: [null, Validators.required]
		});
	}

	get formDetailControls(): { [key: string]: AbstractControl } {
		return this.formDetails.controls;
	}

	get uploadBomFormControls(): { [key: string]: AbstractControl } {
		return this.uploadBomForm.controls;
	}

	loadBomPaGroups() {
		this.bomService.getOfficialGroups().subscribe(
			(res) => {
				this.officialGroups = res;
			},
			(err) => {
				this.responseHandler.error(err, "loadBomPaGroups()");
			}
		);
	}

	schoolTypeData: any;

	loadSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolTypeData: any) => {
			console.log(schoolTypeData);
			this.schoolTypeData = schoolTypeData;
		}, (err) => {
			console.warn(err);
		});
	}

	toggleAddOption(): void {
		this.officialDetailOption = !this.officialDetailOption;
	}

	addBomDetails() {
		this.formDetailsSubmit = true;
		if (this.formDetails.invalid) return;

		this.addBomPa(this.formDetails.value, "true");
	}

	addExcel() {
		this.uploadBomFormSubmit = true;
		if (this.uploadBomForm.invalid) return;

		if (this.uploadedBom?.length === 0) {
			const message = this.translate.instant("common.toastMessages.excelUpload.emptyContentsError");
			this.responseHandler.error({ message }, "addExcel()");
			return;
		}

		this.addBomPa(this.uploadedBom, "false");
	}

	getUploadedBom(bom: any) {
		this.uploadedBom = bom;
		this.uploadBomFormControls["file"].setValue("file uploaded");
	}

	isAddingBom = false;
	get excelFilename(): string {
		const fileNameKey = "bom.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.";

		if (this.schoolTypeData?.isIvorianSchool) {
			return this.translate.instant(fileNameKey+"fileNameIvory");
		}

		if (this.schoolTypeData?.isOLevelSchool) {
			return this.translate.instant(fileNameKey+"fileNameBog");
		}

		return this.translate.instant(fileNameKey+"fileName");
	}

	addBomPa(model: any, single: string) {
		const formData = new FormData();

		formData.append("official", JSON.stringify(model));
		formData.append("single", single);

		this.isAddingBom = true;

		this.bomService.addOfficialDetails(formData)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isAddingBom = false),
			)
			.subscribe({
				next: (res) => {
					this.responseHandler.success(res, "addBomPa()");
					if (this.uploadedBom !== null && this.uploadedBom.length > 0) {
						this.uploadedBom = null;
					}
				},
				error: (err) =>	this.responseHandler.error(err, "addBomPa()"),
				complete: () => {
					this.summaryService.setSchoolSummary();
					this.navigateToBomList();
				}
			});
	}

	private navigateToBomList() {
		this.router.navigate(["/main/bom/manage"]);
	}

	get templateHeaders(): Array<ExcelTemplateHeader> {
		return [
			{
				key: "name",
				value: "NAME",
				translate: true,
			},
			{
				key: "phone",
				value: "PHONE",
				translate: true,
			},
			{
				key: "title",
				value: "TITLE",
				translate: true,
			},
			{
				key: "nationalIdNumber",
				value: "NATIONAL_ID_NO",
				width: 16,
				translate: true,
			},
			{
				key: "group",
				value: "GROUP",
				translate: true,
			}
		];
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
