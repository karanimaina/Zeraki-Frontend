import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { EvaluationService } from "../../../@core/services/exams/evaluations/evaluation.service";
import { CompetencyArea } from "../../../@core/models/evaluation/competency-area";
import { EvaluationType } from "../../../@core/models/evaluation/evaluation-type";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { SubjectWithTopics } from "../../../@core/models/classes/subject-with-topics";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-create-evaluation",
	templateUrl: "./create-evaluation.component.html",
	styleUrls: ["./create-evaluation.component.scss"]
})
export class CreateEvaluationComponent implements OnInit {
	classId!: number;
	className = "";
	streamId!: number;
	terms = [
		{ label: "Term 1", value: 1 },
		{ label: "Term 2", value: 2 },
		{ label: "Term 3", value: 3 },
	];
	years: number[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
	assessmentTypes = [
		{
			name: "Exam",
			value: 1
		}
	];
	evaluationTypes: EvaluationType[] = [];
	selectedYear = new Date().getFullYear();
	otherYears: number[] = [];
	competencyTypes = [];
	selectedEvaluationType!: number;
	selectedAssessmentType!: number;
	selectedTopic!: number;
	selectedCompetencyArea!: number;
	evaluationForm: FormGroup = new FormGroup({
		term: new FormControl(null, Validators.required),
		year: new FormControl(null, Validators.required),
	});
	submitted = false;
	competencyAreas: CompetencyArea[] = [];
	subjectTopics!: SubjectWithTopics;
	competencyLoading = false;
	topicsLoading = false;
	projectTitle = "";

	constructor(private location: Location,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private evaluationService: EvaluationService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private classesService: ClassesService) { }

	ngOnInit(): void {
		this.classId = parseInt(<string>this.activatedRoute.snapshot.paramMap.get("classId"));

		this.getClassName();
		this.setSchoolYears();
		this.getEvaluationTypes();
		this.getSubjectTopics();

	}

	getClassName() {
		this.evaluationService.getClassName(this.classId).subscribe({
			next: (res) => {
				this.className = res.className;
				this.streamId = res.streamId;
			},
			error: (err) => {
				this.toastService.error(err.error.response.message);
			}
		});
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

	get f(): { [key: string]: AbstractControl } {
		return this.evaluationForm.controls; 
	}

	navigateBack() {
		this.location.back();
	}

	onSubmit() {
		this.submitted = true;
		if (this.evaluationForm.invalid) {
			return;
		}

		const { term, year } = this.evaluationForm.value;

		if (this.selectedAssessmentType == 1) {
			const data = {
				classId: this.classId,
				term,
				year,
				maximumScore: 80
			};
			this.evaluationService.createExam(data).subscribe({
				next: (res: any) => {
					this.evaluationCreated(res.examId, 0);
				},
				error: (err) => {
					const message = this.translate.instant("evaluation.create.toastMessages.createExamError", { examName: err.error.response.message });
					this.toastService.error(message);
				}
			});
		} else {
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

					this.evaluationCreated(evaluationId, data.typeId);
				},
				error: (err) => {
					const message = this.translate.instant("evaluation.create.toastMessages.createEvaluationError", { reason: err.error.response.message });
					this.toastService.error(message);
					// this.toastService.error( `Failed to create an evaluation. <br> <b>Reason:  ${err.error.response.message}</b>`);
				}
			});
		}
	}

	evaluationCreated(evaluationId: number, assessmentType: number) {
		const titleOption1 = this.translate.instant("evaluation.create.swal.titleOption1");
		const titleOption2 = this.translate.instant("evaluation.create.swal.titleOption2");
		const examText = this.translate.instant("evaluation.create.swal.exam");
		const evaluationText = this.translate.instant("evaluation.create.swal.evaluation");

		Swal.fire({
			title: `${!assessmentType ? titleOption1 : titleOption2}`,
			text: this.translate.instant("evaluation.create.swal.exam", { type: !assessmentType ? examText : evaluationText }),
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
					//this.location.back();
					this.router.navigate(["/main/classes/myclass/"]);
				}
				if (result.isConfirmed) {
					let paramValue = "";
					if (assessmentType == 0) {
						paramValue = "exam";
					} else if (assessmentType == 1) {
						paramValue = "evaluation";
					} else if (assessmentType == 2) {
						paramValue = "project";
					}
					this.router.navigate(["main/evaluation/upload/" + evaluationId], { queryParams: { class: this.classId, type: paramValue, str: this.streamId } });
				}
			});
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

	changeSelectedTopic(id: number, $event: Event) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			this.selectedTopic = id;
			this.getCompetencyAreas(id);
		} else {
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

	changeCompetencyTypes(id: number, $event: Event) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			this.selectedCompetencyArea = id;
		} else {
			this.selectedCompetencyArea = null!;
		}
	}

	getEvaluationTypes() {
		this.evaluationService.getEvaluationTypes().subscribe((evaluations) => {
			this.evaluationTypes = evaluations;
		});
	}

	private setSchoolYears() {
		//Set current year and 5 previous years
		this.selectedYear = new Date().getFullYear();
		this.otherYears = [2, 1].map(y => {
			return this.selectedYear - y;
		});
		this.otherYears.push(this.selectedYear);
	}

	private getSubjectTopics() {
		this.topicsLoading = true;
		this.classesService.getSubjectTopics(null!, null!, this.classId, this.selectedYear).subscribe((subjectTopics) => {
			this.topicsLoading = false;
			this.subjectTopics = subjectTopics;
		}, (err) => {
			this.topicsLoading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	updateSubjectTopics(year: any) {
		// Reset topics and competencies related variables
		this.subjectTopics = null!;
		this.selectedTopic = null!;
		this.competencyAreas = [];
		this.selectedCompetencyArea = null!;

		if (!this.selectedAssessmentType || this.selectedAssessmentType == 2) {
			this.getSubjectTopics();
		}
	}
}
