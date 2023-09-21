import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ExamService } from "src/app/@core/services/exams/exam.service";

@Component({
	selector: "app-add-intake",
	templateUrl: "./add-intake.component.html",
	styleUrls: ["./add-intake.component.scss"]
})
export class AddIntakeComponent implements OnInit {

	selectedExam: any;
	editExamName = false;

	fms = "forms";
	years = "years";
	classes = "classes";
	seniors = "seniors";

	random = [1, 2, 3, 4, 5];
	@Input() forms: any;
	@Input() exam: any;
	@Input() schoolData: any;

	@Output() closeAddIntake: EventEmitter<any> = new EventEmitter();
	@Output() addedIntakes: EventEmitter<number[]> = new EventEmitter();
	routeParams: any;

	examForms: any[] = [];
	loading = false;

	constructor(
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router,
		private route: ActivatedRoute,
	) { }

	ngOnInit(): void {
		this.schoolData.formoryear = this.schoolData.formoryear.toString().trim().toLowerCase();
		this.route.params.subscribe((p) => {
			this.routeParams = p;
		});
		this.examForms = this.forms.filter(
			({ intakeid: id1 }) => {
				!this.exam.forms.some(({ intakeid: id2 }) => { id2 === id1; });
			}
		);
		this.examForms = this.forms.filter((obj) => {
			return !this.exam.forms.some((obj2) => {
				return obj.intakeid == obj2.intakeid;
			});
		});
		this.examForms.forEach(e => {
			e.selected = false;
			e.min = null;
		});
	}

	addIntake(form: NgForm) {
		//check if any of the forms are selected
		let sForms = false;
		const errorArray: any[] = [];
		const formsArray: any[] = [];
		this.examForms.forEach((form) => {
			if (form.selected == true) {
				sForms = true;
				//check min
				if (form.min == null) {
					const errorMsg = this.translate.instant("exams.addIntake.toastMessages.formErrors.minSubjectsMissing", { formOrYear: this.schoolData?.formoryear, form: form.form });
					errorArray.push(errorMsg);
					// errorArray.push("Enter Minimum number of subjects for  : " + this.schoolData?.formoryear + " " + form.form);
				}
				//check value
				else if (form.min < this.schoolData?.minSubjects) {
					const errorMsg = this.translate.instant("exams.addIntake.toastMessages.formErrors.minSubjectsLess", { formOrYear: this.schoolData?.formoryear, form: form.form, minSubjects: this.schoolData?.minSubjects });
					errorArray.push(errorMsg);
					// errorArray.push(" Minimum  subjects for : " + this.schoolData?.formoryear + " " + form.form + " can't be less than " + this.schoolData?.minSubjects);
				}
				//everything okay, prepare your object
				else {
					formsArray.push({ intakeid: form.intakeid, selected: true, min: parseInt(form.min) });
				}
			}

		});
		if (sForms == false) {
			const errorMsg = this.translate.instant("exams.addIntake.toastMessages.formErrors.noFormSelected");
			errorArray.push(errorMsg);
			// errorArray.push("Select atleast one form");
		}
		if (errorArray.length > 0) {
			this.toastService.error(errorArray[0]);
		} else {
			const forms = form.value;

			const url = `/results/intake?seriesId=${this.exam.seriesid}&forms=${JSON.stringify(formsArray)}`;

			this.loading = true;

			this.examService.doPostNoParams(url).subscribe((res) => {
				this.loading = false;
				// this.toastService.success(res.message)
				const intakeIds = formsArray.map(f => f.intakeid);
				this.examForms = this.examForms.filter((obj) => !formsArray.some(((form) => form.intakeid == obj.intakeid)));

				this.addedIntakes.emit(intakeIds);

				this.toastService.success(this.translate.instant("exams.editExams.classAdded", { formoryear: this.schoolData?.formoryear}));
			}, (err) => {
				this.loading = false;
				if (err.error.response && err.error.response.message) {
					this.toastService.error(err.error.response.message);
				}else {
					this.toastService.error(this.translate.instant("behaviour.classBehaviour.toastMessages.loadBehaviourTimeline.error"));
				}
			});
			// console.log(url)
		}


	}

	onCloseAddIntakeView() {
		this.closeAddIntake.emit();
	}

}
