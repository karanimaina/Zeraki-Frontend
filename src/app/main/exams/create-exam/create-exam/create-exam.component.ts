import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SchoolTypes } from "../../../../@core/enums/school-types";

type examTypeOptions = "ordinary" | "consolidated" | "yearAverage" | "kcse" | "termAverage" | "assignment"

@Component({
	selector: "app-create-exam",
	templateUrl: "./create-exam.component.html",
	styleUrls: ["./create-exam.component.scss"]
})
export class CreateExamComponent implements OnInit {

	@ViewChild("successAlert") successAlert: any;
	@ViewChild("successAssignmentAlert") successAssignmentAlert: any;

	selectedExamTypeOption: examTypeOptions = "ordinary";
	examOptionsFormGroup!: FormGroup;
	schoolTypes = SchoolTypes;

	examList!: any;
	forms!: any;
	isLoadingForms = false;
	currentYear!: number;
	series: any = { term: "" };

	isGuineaSchool = false;
	isAddingOrdinaryExam = false;
	schoolTypeData: any;

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private router: Router,
		private toastService: HotToastService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
		private formBuilder: FormBuilder
	) { }

	ngOnInit(): void {
		// this.examList = this.examService.getExamList();
		this.initializeExamForm();
		this.getCurrentYear();
		this.loadExamList();
		this.loadForms();
		this.dataService.schoolData.subscribe(resp => {
			this.schoolTypeData = resp;
			this.isGuineaSchool = (resp && Object.keys(resp).length > 0) ? resp?.isGuineaSchool : false;
		});
	}

	private initializeExamForm() {
		this.examOptionsFormGroup = this.formBuilder.group({
			examOption: [this.selectedExamTypeOption]
		});

		this.watchExamFormOptionsChanges();
	}

	watchExamFormOptionsChanges() {
		this.examOptionsFormGroup.controls["examOption"].valueChanges.subscribe((selectedOption) => {
			this.selectedExamTypeOption = selectedOption;
		});
	}

	loadForms() {
		this.isLoadingForms = true;
		this.examService.getForms().subscribe(
			(res) => {
				this.forms = res;
				// setup the form content here
				const arrayForms: any[] = [];
				for (let i = 0; i < this.forms.length; i++) {
					const e = this.forms[i];
					arrayForms.push({
						form: e,
						selected: false,
						min: null,
						name: `Form-${e}`
					});
				}
				this.forms = arrayForms;
			},
			(err) => {
				this.forms = [];
				this.responseHandler.error(err, "createExam()");
			},
			() => {
				this.isLoadingForms = false;
			}
		);
	}

	getCurrentYear() {
		this.examService.getCurrentYear().subscribe(
			(res) => {
				this.currentYear = res;
				this.series.year = this.currentYear;
			},
			(err) => {
				this.responseHandler.error(err, "loadYears()");
			}
		);
	}

	loadExamList() {
		this.examService.getExamList().subscribe(
			(res) => {

				if (Object.keys(res).length !== 0) {
					this.examList = res;
				}
			},
			(err) => {
				this.forms = [];
				this.responseHandler.error(err, "loadYears()");
			}
		);
	}


	createExam(form: NgForm) {
		if (!form.valid) {
			if (form.controls.name?.errors?.pattern) {
				this.toastService.warning("Invalid exam name");
			}
			return;
		}
		// checking for empty exam name
		if (form.value.name.trim().length === 0) {
			const examName = this.translate.instant("exams.createExam.labelTextExamName");
			const errorMsg = this.translate.instant("common.toastMessages.formEmptySpaceWarning", { name: examName });
			this.toastService.warning(errorMsg);
			return;
		}

		let formSelected = false;
		const formsContent: any[] = [];
		const formsContentError: any[] = [];


		for (let a = 0; a < this.forms.length; a++) {
			const x = this.forms[a];
			// console.log(x);
			if (x.selected == true) {
				formSelected = true;
				//check if it has a value
				if (x.min == null || x.min.length == 0 || x.min == "") {
					const errorMsg = this.translate.instant("exams.createExam.toastMessages.createExamForm.subjectsWaning", { for: x.form });
					formsContentError.push(errorMsg);
					// formsContentError.push("Enter Subjects done for form : " + x.form);
				} else {
					formsContent.push(x);
				}

			}
		}
		if (formSelected) {
			//check for errors
			if (formsContentError.length > 0) {
				this.toastService.warning(formsContentError[0]);
			} else {
				// const isAssignment = (this.selectedExamTypeOption == "assignment")
				const params = "?forms=" + JSON.stringify(formsContent)// + "&isAssignment=" + isAssignment;
				const data:any = {
					name: form.value.name.trim(),
					term: form.value.term,
					year: form.value.year,

				};

				this.schoolTypeData.isIvorianSchool ? data.examType = form.value.examType:'';
				this.schoolTypeData.isGuineaSchool ? data.examType = (this.selectedExamTypeOption == "assignment") ? 'ASSIGNMENT':'ORDINARY_EXAM':'';

				this.isAddingOrdinaryExam = true;
				this.examService.addExamSeries(data, params).subscribe({
					error: (err) => {
						this.responseHandler.error(err, "createExam()");
						this.isAddingOrdinaryExam = false;
					},
					complete: () => {
						this.showSuccessMessage();
						this.isAddingOrdinaryExam = false;
					}
				});

			}
		} else {
			const errorMsg = this.translate.instant("exams.createExam.toastMessages.createExamForm.formSelectionWarning");
			this.toastService.warning(errorMsg);
		}
	}

	showSuccessMessage() {
		this.successAlert.fire();
	}

	viewManageExams() {
		this.router.navigateByUrl("/main/exams/manage");
	}

}
