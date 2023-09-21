import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-year-average-exams",
	templateUrl: "./year-average-exams.component.html",
	styleUrls: ["./year-average-exams.component.scss"]
})
export class YearAverageExamsComponent implements OnInit {

	streamIntakes: any = [];

	formAcademicYears: any[] = [];

	ya_form!: FormGroup;

	gradingSystems!: any;

	exams: any = { ay_term_exams: { examList: [], selected_exam: null } };

	min = 7;

	rankCriteria = 0;

	terms: any;

	//terms selected
	selectedTerms: any[] = [];

	selectedGs!: any;
	selectedGsId!: any;

	postExams: any[] = [];
	isGenerateYearAverage = false;
	schoolTypeData?: SchoolTypeData;

	@ViewChild("successAlert") successAlert: any;
	@ViewChild("confirmAlert") confirmAlert: any;

	constructor(
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private dataService: DataService,
		private router: Router,
		private mentionService: MentionService,
		private errorHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		// this.streamIntakes = this.examService.getStreamIntakes();
		this.loadStreamIntakes();
		this.initForm();

		// this.gradingSystems = this.examService.getGradeMapping();
		this.getSchoolData();
	}

	getSchoolData() {
		this.dataService.schoolData.subscribe(resp => {
			this.schoolTypeData = resp;
			this.loadGradeMapping();
		});
	}

	loadStreamIntakes() {
		this.examService.getStreamIntakes().subscribe(
			(res) => {
				this.streamIntakes = res;
			}, (error) => {
				this.errorHandler.error(error, "loadStreamIntakes()");
			}
		);
	}

	loadGradeMapping() {
		const mappingObservable: Observable<any> = (this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool)
			?
			this.mentionService.getMentionsMapping()
			:
			this.examService.getGradeMapping();

		mappingObservable.subscribe(
			(res) => {
				this.gradingSystems = res;
				if (res && res !== null && Object.keys(res).length > 0) {
					this.selectedGs = (res.length > 0) ? res[0] : null;
					this.selectedGsId = (res.length > 0) ? res[0].gsid : null;
				}
			}, (err) => {
				this.errorHandler.error(err, "loadGradeMapping()");
			}
		);
	}

	setSelectedGs() {
		if (this.selectedGsId !== "") {
			for (let i = 0; i < this.gradingSystems.length; i++) {
				const gs = this.gradingSystems[i];
				if (gs.gsid == this.selectedGsId) {
					this.selectedGs = gs;
				}
			}
		} else {
			this.selectedGs = null;
		}
	}

	setSelectedGs_Subjects(gs: any, priview: any, index: any) {
		const subject = this.exams;
	}

	initForm() {
		this.ya_form = new FormGroup({
			form: new FormControl(""),
			academicYears: new FormControl("")
		});
	}

	initExamData() {
		const ay_term_exams: any[] = [];
		// create an object to work with
		for (let i = 0; i < this.exams.terms.length; i++) {
			const term: string = this.exams.terms[i].toString();
			const exams: any = this.exams.term_exams[term].list;
			ay_term_exams.push({
				term: term,
				examList: exams,
				selected_exam: null
			});
		}
		this.exams.ay_term_exams = ay_term_exams;
	}

	formSelected() {
		//loadAcademicYears
		const intake = this.ya_form.value.form;
		if (intake !== "") {
			this.examService.getFormAcademicYears(intake).subscribe(
				(res) => {
					this.formAcademicYears = res.academicyears;
					this.terms = res.terms;
				}, (err) => {
					this.errorHandler.error(err, "formSelected()");
				}
			);
		} else {
			this.formAcademicYears = [];
		}
	}

	academicYearSelected() {
		//load  exam intakes
		const intake = this.ya_form.value.form;
		const ayid = this.ya_form.value.academicYears;
		const params = "/?intakeid=" + intake + "&ayid=" + ayid;
		this.exams = this.examService.getAyExams(params).subscribe(
			(res) => {
				this.exams = res;
				for (let i = 0; i < res.subjects.length; i++) {
					const e = res.subjects[i];
					e.value = (this.selectedGsId == null || this.gradingSystems.length > 1) ? "" : this.selectedGsId;
				}
				this.initExamData();

			}, (err) => {
				this.errorHandler.error(err, "academicYearSelected()");
			}
		);
	}


	generateYearAverage() {

		const postExams: any[] = [];

		// console.log(this.exams.ay_term_exams);

		for (let i = 0; i < this.exams.ay_term_exams.length; i++) {
			const e = this.exams.ay_term_exams[i];

			let examArray: any[] = [];
			if (!(e.selected_exam == null || e.selected_exam == "null")) {
				for (let j = 0; j < e.examList.length; j++) {
					const exam = e.examList[j];
					if ((exam.seriesid == e.selected_exam) || (exam.egroupid == e.selected_exam)) {
						examArray.push(exam);
					}
				}

			}
			if (examArray.length > 0) {
				const examData:any = {
					term:Number(e.term)
				};

				if (this.schoolTypeData?.isIvorianSchool || this.schoolTypeData?.isGuineaSchool) {
					examData.egroupId = examArray[0].egroupid
				} else {
					examData.exam = examArray[0];
				}

				postExams.push(examData);
			}
			examArray = [];

		}

		this.postExams = postExams;

		const subjectGradingError: any[] = [];

		if (!this.schoolTypeData?.isGuineaSchool) {
			for (let a = 0; a < this.exams.subjects.length; a++) {
				const subject = this.exams.subjects[a];
				if (subject.value == "") {
					subjectGradingError.push(subject.name);
				}
			}
		}

		const showGradingSystems = !this.schoolTypeData?.isGuineaSchool || !this.schoolTypeData?.isIvorianSchool;
		//check if selected exams is atleast 2 exams
		if (postExams.length < 2) {
			const errorMsg = this.translate.instant("exams.yearAverageExams.toastMessages.atLeastTwoEamsWarning");
			this.toastService.warning(errorMsg);
		}
		//check if grading system is selected
		else if (showGradingSystems && this.selectedGs == null) {
			const errorMsg = this.translate.instant("exams.yearAverageExams.toastMessages.missingGradingSystemWarning");
			this.toastService.warning(errorMsg);
		}
		//check if all subjects have grading systems set
		else if (showGradingSystems && subjectGradingError.length > 0) {
			const errorMsg = this.translate.instant("exams.yearAverageExams.toastMessages.missingSubjectGradingSystemWarning", { subject: subjectGradingError[0] });
			this.toastService.warning(errorMsg);
		} else {
			//initialise the action button
			this.confirmAlert.fire();
		}

	}

	saveYearAverage() {
		const saveGuineaYearAverage = this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;
		saveGuineaYearAverage ? this.saveGuineaYearAverage() : this.saveKenyaYearAverage();
	}

	saveKenyaYearAverage() {
		//exams
		const subjectGS: any = {};
		for (let i = 0; i < this.exams.subjects.length; i++) {
			const sgs = this.exams.subjects[i];
			// console.log(sgs)
			if (sgs.value != null) {
				subjectGS[sgs.textCode] = +sgs.value;
			}

		}

		// console.log(subjectGS)
		this.isGenerateYearAverage = true;
		const param = "?intakeid=" + this.ya_form.value.form
			+ "&ayid=" + this.ya_form.value.academicYears
			+ "&grading=" + this.selectedGsId
			+ "&rp=" + this.rankCriteria + "&min=" + this.min
			+ "&subjectgrading=" + JSON.stringify(subjectGS) + "&term_exams=" + JSON.stringify(this.postExams);

		// console.log({params:param})
		this.examService.addYearAverageExam(param).subscribe(
			(res) => {
				// console.log(res)
				this.successAlert.fire();
			}, (err) => {
				this.errorHandler.error(err, "saveKenyaYearAverage()");
			}, () => {
				this.isGenerateYearAverage = false;
			}
		);

	}

	saveGuineaYearAverage() {
		//exams
		const subjectGS: any = {};
		for (let i = 0; i < this.exams.subjects.length; i++) {
			const sgs = this.exams.subjects[i];
			if (sgs.value != null) {
				subjectGS[sgs.textCode] = +sgs.value;
			}

		}



		const param = "?intakeid=" + this.ya_form.value.form
			+ "&ayid=" + this.ya_form.value.academicYears
			+ "&term_exams=" + JSON.stringify(this.postExams);
		const postData = {
			intakeId:this.ya_form.value.form,
			academicYearId:this.ya_form.value.academicYears,
			termExams:this.postExams
		};

		this.isGenerateYearAverage = true;
		this.examService.addGuineaYearAverageExam(postData).subscribe(
			(resp) => {
				// //console.log(res)
				this.successAlert.fire();
			}, (err) => {
				this.errorHandler.error(err, "saveGuineaYearAverage()");
				this.isGenerateYearAverage = false;
			}, () => {
				this.isGenerateYearAverage = false;
			}
		);

	}

	viewManageExams() {
		this.router.navigateByUrl("/main/exams/manage");
	}

	get isSouthAfricanSchool(): boolean {
		return (
			this.schoolTypeData?.isSouthAfricaPrimarySchool ||
			this.schoolTypeData?.isSouthAfricaSecondarySchool ||
			false
		);
	}
}
