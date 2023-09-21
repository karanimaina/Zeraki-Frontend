
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TeacherService } from "src/app/@core/services/teacher/teacher.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { emptyStringValidator } from "../../../@core/shared/directives/empty-string-validator.directive";
import { phoneNumberValidator } from "../../../@core/shared/directives/phone-validator.directive";
import { ExcelTemplateHeader } from "../../../@core/models/excel/excel-template-header";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";


@Component({
	selector: "app-add-teacher",
	templateUrl: "./add-teacher.component.html",
	styleUrls: ["./add-teacher.component.scss"]
})
export class AddTeacherComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	@Input() schoolSetup = false;
	teacherDetailOption = true;
	uploadedTeacher: any = null;
	teacherGroups!: any;
	textTscNo: any = "";
	schoolTypeData?: SchoolTypeData;

	newTeacherForm: FormGroup = new FormGroup({
		NAME: new FormControl("", [Validators.required, emptyStringValidator]),
		PHONE: new FormControl("", [phoneNumberValidator]),
		TSC_NO: new FormControl(""),
		GENDER: new FormControl(),
		NATIONAL_ID_NO: new FormControl(),
		ADDRESS: new FormControl(""),
		GROUP: new FormControl()
	});
	submitted = false;
	loading = false;

	uploadTeacherForm!: FormGroup;
	submitUploadTeacherForm = false;

	teacherDetail: any = {
		NAME: null,
		PHONE: null,
		TSCNO: null,
		GENDER: null,
		NATIONALID: null,
		group: []
	};

	constructor(
		private teacherService: TeacherService,
		private translate: TranslateService,
		private router: Router,
		private dataService: DataService,
		private summaryService: SummaryService,
		private errorHandler: ResponseHandlerService,
		private fb: FormBuilder,
	) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.initUploadTeacherForm();
		this.loadTeacherGroups();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	initUploadTeacherForm() {
		this.uploadTeacherForm = this.fb.group({
			teacherFile: [null, Validators.required]
		});
	}

	loadTeacherGroups() {
		this.teacherService.getAllTeacherGroups().pipe(takeUntil(this.destroy$)).subscribe(
			(response) => {
				this.teacherGroups = response;
			},
			(error) => {
				console.log(error);
			},
			() => {
				console.log("complete");
			}
		);
	}

	get newTeacherControls(): { [key: string]: AbstractControl } {
		return this.newTeacherForm.controls;
	}

	viewTeacherDetailSection() {
		this.teacherDetailOption = true;
	}
	viewTeacherSpreadSheet() {
		this.teacherDetailOption = false;
	}

	downloadTeacherExcelTemplate() {
		this.teacherService.generateTeacherExcelTemplate();
	}

	onSubmitTeacherByDetail() {
		this.submitted = true;

		if (this.newTeacherForm.invalid) {
			return;
		}

		const formData = new FormData();

		formData.append("teacher", JSON.stringify(this.newTeacherForm.value));
		formData.append("single", "true");

		this.loading = true;
		this.teacherService.addTeacherByDetail(formData).pipe(takeUntil(this.destroy$)).subscribe(
			(res) => {
				this.loading = false;
				Swal.fire({
					title: this.translate.instant("teachers.add.swal.title"),
					text: res.message,
					icon: "success",
					confirmButtonColor: "#43AB4F",
					confirmButtonText: this.translate.instant("common.swal.confirmButtonTextClose")
				}).then((isConfirm) => {
					if (isConfirm.isConfirmed) {
						(!this.schoolSetup) ? this.router.navigate(["/main/teachers/manage"]) : this.router.navigate(["/main/dashboard/welcome"]);
					}
				});
			},
			(err) => {
				this.loading = false;
				this.errorHandler.error(err, "onSubmitTeacherByDetail()");
			},
			() => {
				this.summaryService.setSchoolSummary();
			}
		);
	}

	readTeacherExcelData(file: any) {
		const d = null;
		const filename = file.target.files[0];
		console.log(filename);
		const reader: FileReader = new FileReader();
		reader.readAsBinaryString(filename);
		reader.onload = (e: any) => {
			/* create workbook */
			const binarystr: string = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: "binary" });

			/* selected the first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
			const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
			this.uploadedTeacher = data;
		};
		// return d;
	}

	getUploadedTeacher(teachers: any) {
		this.uploadedTeacher = teachers;
		this.uploadTeacherForm.get("teacherFile")?.setValue("File uploaded");
	}

	addTeacherExcel() {
		this.submitUploadTeacherForm = true;
		if (this.uploadTeacherForm.invalid) return;
		const formData = new FormData();

		formData.append("teacher", JSON.stringify(this.uploadedTeacher));
		formData.append("single", "false");

		this.teacherService.addTeacherByDetail(formData).pipe(takeUntil(this.destroy$)).subscribe(
			(res) => {
				this.handleResponse(this.translate.instant("teachers.add.swal.title2"), res.message, "success");
			},
			(err) => {
				console.log(err);
				this.handleResponse(this.translate.instant("teachers.add.swal.titleError"), err.error.message, "error");
			}
		);

	}

	get teacherFile(): { [key: string]: AbstractControl } {
		return this.uploadTeacherForm.controls;
	}

	handleResponse(title: any, message: any, icon: any) {
		Swal.fire({
			title: title,
			text: message,
			icon: icon,
			showConfirmButton: (icon == "success") ? true : false,
			showCancelButton: (icon == "error") ? true : false,
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				(!this.schoolSetup) ? this.router.navigate(["/main/teachers/manage"]) : this.router.navigate(["/main/dashboard/welcome"]);
			}
		});
	}

	get isZimbabweSchool() {
		return this.schoolTypeData?.isZimbabwePrimarySchool || this.schoolTypeData?.isZimbabweSecondarySchool || this.schoolTypeData?.isZimbabweIgcse;
	}

	get isZambiaSchool() {
		return this.schoolTypeData?.isZambiaPrimarySchool || this.schoolTypeData?.isZambiaSecondarySchool;
	}

	get isKenyanSchool() {
		return this.schoolTypeData?.isKcpePrimarySchool || this.schoolTypeData?.isKcseSchool || this.schoolTypeData?.isIgcse;
	}

	get templateHeaders(): Array<ExcelTemplateHeader> {
		let tscNumberKey = "";

		if (this.isZimbabweSchool || this.isZambiaSchool) {
			tscNumberKey = "ecNumber";
		} else if (this?.isKenyanSchool) {
			tscNumberKey = "tscNumber";
		} else {
			tscNumberKey = "regNumber";
		}

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
				key: tscNumberKey,
				value: "TSC_NO",
				translate: true,
			},
			{
				key: "nationalIdNumber",
				value: "NATIONAL_ID_NO",
				width: 16,
				translate: true,
			},
			{
				key: "gender",
				value: "GENDER",
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
