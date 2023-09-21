import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { StaffService } from "src/app/@core/services/staff/staff.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";

@Component({
	selector: "app-add-staff",
	templateUrl: "./add-staff.component.html",
	styleUrls: ["./add-staff.component.scss"]
})
export class AddStaffComponent implements OnInit {

	staffDetailOption = true;
	staffGroups!: any[];
	uploadedStaff: any = null;

	detailStaffForm!: FormGroup;
	submitDetailStaffForm = false;

	uploadStaffForm!: FormGroup;
	submitUploadStaffForm = false;

	constructor(
		private summaryService: SummaryService,
		private staffService: StaffService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router,
		private fb: FormBuilder,
		private errorHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		this.initForms();
		this.loadStaffGroups();
	}

	initForms() {
		this.detailStaffForm = this.fb.group({
			TITLE: [null, Validators.required],
			NAME: [null, Validators.required],
			PHONE: [null],
			NATIONAL_ID_NO: [null],
			ADDRESS: [""],
			GROUP: [null],
		});
		this.uploadStaffForm = this.fb.group({
			staffFile: [null, Validators.required]
		});
	}

	loadStaffGroups(): void {
		this.staffService.getAllStaffGroups().subscribe(
			(res) => {
				this.staffGroups = res;
			},
			(err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred2");
				this.toastService.error(message);
			}
		);
	}

	toggleAddOption(): void {
		this.staffDetailOption = !this.staffDetailOption;
	}

	getUploadedStaff(staff: any) {
		this.uploadedStaff = staff;
		this.staffFormControls["staffFile"].setValue("File uploaded");
	}

	addStaffDetails() {
		this.submitDetailStaffForm = true;

		if (this.detailStaffForm.invalid) return;

		this.addStaff(this.detailStaffForm.value, "true");
	}

	addStaffExcel() {
		this.submitUploadStaffForm = true;

		if (this.uploadStaffForm.invalid) return;

		this.addStaff(this.uploadedStaff, "false");
	}

	get staffFormControls(): { [key: string]: AbstractControl } {
		return this.uploadStaffForm.controls;
	}

	get staffDetailFormControls(): { [key: string]: AbstractControl } {
		return this.detailStaffForm.controls;
	}

	isAdding = false;

	addStaff(model: any, single: string) {
		const fd = new FormData();

		fd.append("worker", JSON.stringify(model));
		fd.append("single", single);

		this.isAdding = true;
		this.staffService.addStaffDetails(fd).subscribe(
			(res) => {

				const message = this.translate.instant("staff.add.toastMessages.success");
				this.toastService.success(message);

				if (this.uploadedStaff !== null && this.uploadedStaff.length > 0) {
					this.uploadedStaff = null;
				}
				this.isAdding = false;
			},
			(err) => {
				this.errorHandler.error(err, "addStaff()");
				this.isAdding = false;
			},
			() => {
				this.summaryService.setSchoolSummary();
				this.router.navigate(["/main/staff/manage"]);
			}
		);
	}


	get templateHeaders() {
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

}
