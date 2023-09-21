import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import { FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { SubjectWithTopics } from "src/app/@core/models/classes/subject-with-topics";
import { CompetencyArea } from "src/app/@core/models/evaluation/competency-area";
import { EvaluationList } from "src/app/@core/models/evaluation/evaluation-list";
import { EvaluationType } from "src/app/@core/models/evaluation/evaluation-type";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { EvaluationService } from "src/app/@core/services/exams/evaluations/evaluation.service";
import { OLEVEL_TERMS } from "src/app/@core/shared/utilities/olevel-terms";
import Swal from "sweetalert2";


@Component({
	selector: "app-new-assessment",
	templateUrl: "./new-assessment.component.html",
	styleUrls: ["./new-assessment.component.scss"]
})
export class NewAssessmentComponent implements OnInit, OnDestroy {
	@ViewChild("btnDismissModal") btnDismissModal!: ElementRef;

	@Input() routeState = "";
	@Input() assessmentName = "";
	@Input() evaluationData?: EvaluationList;
	@Input() classId!: number;
	@Input() academicYears: Array<{ ayid: number, name: string }> = [];
	@Input() selectedYear!: string;
	@Input() selectedAcademicTermID!: number;
	@Input() latestTermID?: number;

	@Output() successModalResult = new EventEmitter<{result: "isDismissed" | "isConfirmed", evaluationId: number, assessmentType: number,}>();

	readonly OLEVEL_TERMS = [...OLEVEL_TERMS];
	projectTitle = "";
	evaluationTypes: EvaluationType[] = [];
	subjectTopics!: SubjectWithTopics;
	selectedTopic!: number;
	selectedCompetencyArea!: number;
	competencyAreas: CompetencyArea[] = [];
	competencyLoading = false;
	isCreatingAssessment = false;
	selectedAssessmentType!: number;
	selectedEvaluationType!: number;
	selectedAssessmentYear = new Date().getFullYear();
	submitted = false;
	terms = OLEVEL_TERMS;
	assessmentTypes = [
		{
			name: "Exam",
			value: 1
		}
	];
	otherYears: number[] = [];
	topicsLoading = false;

	evaluationCreationForm: FormGroup = new FormGroup({
		year: new FormControl(null, Validators.required),
		term: new FormControl(null, Validators.required),
	});

	get formControl(): { [key: string]: AbstractControl } {
		return this.evaluationCreationForm.controls; 
	}

	get isEvaluation(): boolean {
		return this.routeState === "evaluation";
	}

	get isProject(): boolean {
		return this.routeState === "project";
	}

	get isExam(): boolean {
		return !this.isEvaluation && !this.isProject;
	}

	constructor(
		private classesService: ClassesService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private evaluationService: EvaluationService,
	) { }

	ngOnInit(): void {
		this.getEvaluationTypes();
		this.prefillEvaluationType();
		this.setSchoolYears();
		this.getSubjectTopics(+this.selectedYear);
		this.prefillAcademicYearAndTerm();
	}

	ngOnDestroy(): void {
		this.btnDismissModal.nativeElement.click();
	}

	prefillAcademicYearAndTerm() {
		this.evaluationCreationForm.patchValue({
			year: +this.selectedYear || this.otherYears[this.otherYears.length - 1],
			term: this.selectedAcademicTermID || this.latestTermID,
		});
	}

	getEvaluationTypes() {
		this.evaluationService.getEvaluationTypes().subscribe((evaluations) => {
			this.evaluationTypes = evaluations;
		});
	}

	private setSchoolYears() {
		//Set current year and 5 previous years
		this.otherYears = [2, 1].map(y => {
			return this.selectedAssessmentYear - y;
		});
		this.otherYears.push(this.selectedAssessmentYear);
	}

	onSubmit() {
		this.submitted = true;
		if (this.evaluationCreationForm.invalid) return;

		this.isCreatingAssessment = true;

		const { year, term } = this.evaluationCreationForm.value;

		if (this.selectedAssessmentType == 1) { // exam
			const data = {
				classId: this.classId,
				term,
				year,
				maximumScore: 80
			};
			this.evaluationService.createExam(data).subscribe({
				next: (res: any) => {
					this.closeAssessmentCreationModal();
					this.evaluationCreated(res.examId, 0);
					this.isCreatingAssessment = false;
				},
				error: (err) => {
					const message = this.translate.instant("evaluation.create.toastMessages.createExamError", { examName: err.error.response.message });
					this.toastService.error(message);
					this.isCreatingAssessment = false;
				},
			});
		} else { // project and evaluation
			const data = {
				classId: this.classId,
				typeId: this.selectedEvaluationType,
				term,
				year,
				topicId: this.selectedTopic,
				competencyId: this.selectedCompetencyArea,
				maximumScore: 3
			};

			if (this.selectedEvaluationType == 2) {
				data["projectTitle"] = this.projectTitle;
				data["maximumScore"] = 10;
			}

			this.evaluationService.createEvaluation(data).subscribe({
				next: (res: any) => {
					const evaluationId = res.evaluationId | res.projectId;

					this.closeAssessmentCreationModal();
					this.evaluationCreated(evaluationId, data.typeId);
					this.isCreatingAssessment = false;
				},
				error: (err) => {
					const message = this.translate.instant("evaluation.create.toastMessages.createEvaluationError", { reason: err.error.response.message });
					this.toastService.error(message);
					this.isCreatingAssessment = false;
				},
			});
		}
	}

	closeAssessmentCreationModal() {
		const closeBtn: HTMLButtonElement | null = document.querySelector("#btn-assessment-creation-modal");
		closeBtn?.click();
	}

	evaluationCreated(evaluationId: number, assessmentType: number) {
		const title = this.translate.instant("evaluation.create.swal.assessmentCreatedTitleSuccess", { assessmentType: this.assessmentName });

		Swal.fire({
			title,
			icon: "success",
			confirmButtonText: this.translate.instant("evaluation.create.swal.confirmButtonText"),
			confirmButtonColor: "#43ab49",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("evaluation.create.swal.cancelButtonText"),
			reverseButtons: true,
			allowOutsideClick: false
		})
			.then((result) => {
				if (result.isDismissed) {
					this.successModalResult.emit({ result: "isDismissed", evaluationId, assessmentType });
				}

				if (result.isConfirmed) {
					this.successModalResult.emit({ result: "isConfirmed", evaluationId, assessmentType });
				}
			});
	}

	updateSubjectTopics(year: number) {
		// Reset topics and competencies related variables
		this.subjectTopics = null!;
		this.selectedTopic = null!;
		this.competencyAreas = [];
		this.selectedCompetencyArea = null!;

		if (!this.selectedAssessmentType || this.selectedAssessmentType == 2) {
			this.getSubjectTopics(year);
		}
	}

	private getSubjectTopics(year: number) {
		this.topicsLoading = true;
		this.classesService.getSubjectTopics(null!, null!, this.classId, year).subscribe((subjectTopics) => {
			this.topicsLoading = false;
			this.subjectTopics = subjectTopics;
		}, (err) => {
			this.topicsLoading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	prefillEvaluationType() {
		if (this.routeState == "evaluation") {
			this.selectedEvaluationType = 1;
			this.selectedAssessmentType = 2;
			this.selectedTopic = null!;
		} else if (this.routeState == "project") {
			this.selectedEvaluationType = 2;
			this.selectedAssessmentType = 2;
			this.selectedTopic = null!;
		} else { // exam
			this.selectedEvaluationType = null!;
			this.selectedAssessmentType = 1;
			this.selectedTopic = null!;
		}
	}

	changeEvaluationType(id: number, $event: Event) {
		const checkbox = $event.target as HTMLInputElement;

		if (checkbox.checked) {
			this.selectedEvaluationType = id;
			this.selectedAssessmentType = 2;
			this.selectedTopic = null!;
		} else {
			this.selectedEvaluationType = null!;
			this.selectedAssessmentType = null!;
			this.selectedTopic = null!;
		}
	}

	changeAssessmentType(value: number, $event: Event) {
		this.selectedEvaluationType = null!;
		const checkbox = $event.target as HTMLInputElement;

		if (checkbox.checked) {
			this.selectedAssessmentType = value;
		} else {
			this.selectedAssessmentType = null!;
		}
	}

	changeSelectedTopic(id: number, $event: Event) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			this.selectedTopic = id;
			this.getCompetencyAreas(id);
		} else {
			this.selectedTopic = null!;
		}
	}

	getCompetencyAreas(topicId: number) {
		this.selectedCompetencyArea = null!;
		this.competencyLoading = true;
		this.evaluationService.getCompetencies(topicId).subscribe((competencies) => {
			this.competencyLoading = false;
			this.competencyAreas = competencies;

			//Set the competency area to the first one if it's the only that is existing
			if (this.competencyAreas.length === 1) {
				this.selectedCompetencyArea = this.competencyAreas[0].competencyAreaId;
			}

		}, (err) => {
			this.competencyLoading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	changeCompetencyTypes(id: number, $event: Event) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			this.selectedCompetencyArea = id;
		} else {
			this.selectedCompetencyArea = null!;
		}
	}

}
