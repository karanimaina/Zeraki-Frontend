import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";
import { SchoolTypeData } from "../../../../@core/models/school-type-data";

@Component({
	selector: "app-manage-exam",
	templateUrl: "./manage-exam.component.html",
	styleUrls: ["./manage-exam.component.scss"]
})
export class ManageExamComponent implements OnInit {

	routeParams: any = "";
	selectedExamForEdit!: any | null;
	isSelectedExam = false;
	forms: any;

	examList!: any;
	academicYears: Array<{ayid: number, name: string}> = [];
	academicYearForm!: FormGroup;

	isLoadingExamList = false;
	isLoadingSearchExamDetails = false;

	schoolTypeData!: SchoolTypeData;
	isReleaseExamEnabled = false;

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private classesService: ClassesService,
		private errorHandler: ResponseHandlerService,
		private fb: FormBuilder
	) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.initForm();
		this.loadForms();
		this.loadExamList();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}
	initForm() {
		this.academicYearForm = this.fb.group({
			selectedYear: ["", Validators.required]
		});
		this.onFormChange();
	}

	get selectedYear() {
		return this.academicYearForm.get("selectedYear");
	}

	onFormChange() {
		this.selectedYear?.valueChanges.subscribe(val => {
			this.academicYearChange();
		});
	}


	loadForms() {
		this.classesService.getForms().subscribe((val: any) => {
			this.forms = val.forms;
		});
	}

	noExams = true;
	loadExamList(): void {
		this.isLoadingSearchExamDetails = true;
		this.examService.getExamList().subscribe(
			(res) => {
				this.academicYears = res.academic_years;
				this.examList = res;
				if (Object.keys(this.examList)?.length === 0) {
					this.noExams = true;
				} else {
					this.examList.terms = this.examList.terms.sort((a, b) => BasicUtils.compare(a.term, b.term));
					this.isReleaseExamEnabled = this.examList.examRelease;
					this.noExams = false;
				}
			},
			(err) => {
				this.errorHandler.error(err, "loadExamList()");
			},
			() => {
				this.isLoadingSearchExamDetails = false;
				this.academicYearForm.patchValue({
					selectedYear: this.examList.ayid
				});
			}
		);
	}


	onSelectExam(selectedExamForEdit: any) {
		console.warn(selectedExamForEdit);
		this.selectedExamForEdit = selectedExamForEdit;
		this.isSelectedExam = true;
		// this.router.navigate(["/main/exams/edit", selectedExamForEdit.seriesid]);
	}

	toggleSelected(value: any) {
		this.isSelectedExam = value;
	}

	academicYearChange() {
		this.isLoadingExamList = true;
		this.examService.getExamList(this.selectedYear?.value).subscribe(
			(res) => {
				this.examList = res;
				if (Object.keys(this.examList)?.length === 0) {
					this.noExams = true;
				} else {
					this.examList.terms = this.examList.terms.sort((a, b) => BasicUtils.compare(a.term, b.term));
					this.noExams = false;
				}
			},
			(err) => {
				this.errorHandler.error(err, "academicYearChange()");
			},
			() => {
				this.isLoadingExamList = false;

			}
		);
	}


}
