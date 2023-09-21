import {
	Component,
	ComponentFactoryResolver,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewContainerRef
} from "@angular/core";
import Swal from "sweetalert2";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { EvaluationService } from "../../../@core/services/exams/evaluations/evaluation.service";
import { EvaluationList } from "../../../@core/models/evaluation/evaluation-list";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { ExamService } from "../../../@core/services/exams/exam.service";
import { HotToastService } from "@ngneat/hot-toast";
import { Subject, Subscription } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { SweetAlertContentComponent } from "../_components/sweet-alert-content/sweet-alert-content.component";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { OlevelAcademicYear } from "../../../@core/models/olevel/olevel-academic-year";
import { OlevelTerm } from "src/app/@core/models/olevel/olevel-term";
import { OLEVEL_TERMS } from "src/app/@core/shared/utilities/olevel-terms";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-all-evaluations",
	templateUrl: "./all-evaluations.component.html",
	styleUrls: ["./all-evaluations.component.scss"]
})
export class AllEvaluationsComponent implements OnInit, OnDestroy {
	@ViewChild("sweetAlertContent", { read: ViewContainerRef }) sweetAlertContent!: ViewContainerRef;

	destroyed$: Subject<boolean> = new Subject<boolean>();

	readonly OLEVEL_TERMS = [...OLEVEL_TERMS];
	classNameSub?: Subscription;
	assessmentName = "";
	assessmentNamePlural = "";
	classId!: number;
	subjectId!: number;
	evaluationData?: EvaluationList;
	schoolTypeData?: SchoolTypeData;
	schoolYear!: number;
	academicYears$!: Subscription;
	academicYears: Array<{ ayid: number, name: string }> = [];
	academicTerms: Array<OlevelTerm> = [];
	selectedAcademicYearID!: number;
	selectedAcademicTermID!: number;
	latestTermID?: number;
	routeState = "";
	assessmentHeader = "";
	isLoadingAssessmentHeader = false;
	isLoadingAssessments = false;
	isLoadingAcademicYears = false;
	private currentYear: any;
	streamId!: number;
	userRoles?: Role;

	constructor(
		private activatedRoute: ActivatedRoute,
		private evaluationService: EvaluationService,
		private dataService: DataService,
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router,
		private rolesService: RolesService,
		private responseHandlerService: ResponseHandlerService,
		private componentFactoryResolver: ComponentFactoryResolver
	) { }

	ngOnInit(): void {
		this.getUserRoles();
		this.getQueryParams();
		this.getRouteState();
		this.getClassName();
		this.getSchoolData();

		this.setAssessmentNames();

		this.getCurrentYearAndAcademicYears();
		this.getAcademicTerms();
	}

	get isLoading() {
		return this.isLoadingAcademicYears || this.isLoadingAssessments;
	}

	private getUserRoles() {
		this.rolesService.roleSubject.subscribe((role) => {
			this.userRoles = role;
		});
	}

	private getQueryParams() {
		this.activatedRoute.queryParams
			.pipe(
				takeUntil(this.destroyed$),
			)
			.subscribe(params => {
				this.classId = params.class;
				this.subjectId = params.subject;
			});
	}

	private getRouteState() {
		this.activatedRoute.data
			.pipe(
				takeUntil(this.destroyed$),
			)
			.subscribe((data) => {
				this.routeState = data.state;
			});
	}

	getClassName() {
		this.classNameSub = this.evaluationService.getClassName(this.classId).subscribe({
			next: (res) => {
				this.streamId = res.streamId;
			},
			error: (err) => {
				this.responseHandlerService.error(err, "getClassName()");
			}
		});
	}

	private getSchoolData() {
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolTypeData = schoolData;
		});
	}

	private setAssessmentNames(): void {
		this.translate.get(["common.evaluation", "common.evaluations", "common.project", "common.projects", "common.examination", "common.examinations"])
			.subscribe(translations => {
				if (this.routeState == "evaluation") {
					this.assessmentName = translations["common.evaluation"];
					this.assessmentNamePlural = translations["common.evaluations"];
				} else if (this.routeState == "project") {
					this.assessmentName = translations["common.project"];
					this.assessmentNamePlural = translations["common.projects"];
				} else {
					this.assessmentName = translations["common.examination"];
					this.assessmentNamePlural = translations["common.examinations"];
				}
			});

	}

	private getCurrentYearAndAcademicYears() {
		this.isLoadingAcademicYears = true;
		if (!this.assessmentHeader) {
			this.isLoadingAssessmentHeader = true;
		}

		this.academicYears$ = this.examService.getCurrentYear()
			.pipe(
				tap((year) => this.currentYear = year),
				switchMap(() => this.getAcademicYears()),
				takeUntil(this.destroyed$)
			).subscribe({
				next: ({ academicYears }) => {
					this.setAcademicYears(academicYears);
				},
				error: (err) => {
					this.responseHandlerService.error(err, "getCurrentYearAndAcademicYears()");
				},
				complete: () => this.isLoadingAcademicYears = false
			});
	}

	private getAcademicYears() {
		return this.evaluationService.getAcademicYears();
	}

	private setAcademicYears(academicYears: OlevelAcademicYear[]) {
		this.academicYears = academicYears.map(({ academicYearId, beginYear }) => {
			return {
				ayid: academicYearId,
				name: beginYear.toString()
			};
		});

		if (this.academicYears.length > 0) {
			const foundAcademicYear = this.academicYears.find(({ name }) => name == this.currentYear);

			if (foundAcademicYear) {
				this.selectedAcademicYearID = foundAcademicYear.ayid;
			} else {
				this.selectedAcademicYearID = this.academicYears[this.academicYears.length - 1].ayid;
			}

			this.retrieveAssessments();
		}
	}

	private retrieveAssessments() {
		if (this.routeState == "project") {
			this.getProjects();
		} else if (this.routeState == "exam") {
			this.getExams();
		} else {
			this.getEvaluations();
		}
	}

	private getProjects() {
		this.isLoadingAssessments = true;
		if (!this.assessmentHeader) {
			this.isLoadingAssessmentHeader = true;
		}

		this.evaluationService.getProjects(this.classId, this.selectedAcademicYearID, this.selectedAcademicTermID).subscribe({
			next: (evaluationData) => {
				this.schoolYear = evaluationData.year;
				this.evaluationData = evaluationData;
				this.setAssessmentHeader();

				if (this.evaluationData.terms) {
					this.evaluationData.terms.sort((a, b) => b.term - a.term);
				} else {
					this.evaluationData.terms = [];
				}

				this.latestTermID = this.evaluationData?.terms[0]?.term;
				this.setAcademicTerm(this.latestTermID);

				this.isLoadingAssessments = false;
				this.isLoadingAssessmentHeader = false;
			},
			error: (err) => {
				this.isLoadingAssessments = false;
				this.responseHandlerService.error(err, "getProjects()");
			}
		});
	}

	private getExams() {
		this.isLoadingAssessments = true;
		if (!this.assessmentHeader) {
			this.isLoadingAssessmentHeader = true;
		}

		this.evaluationService.getExams(this.classId, this.selectedAcademicYearID, this.selectedAcademicTermID).subscribe({
			next: (examsData) => {
				this.evaluationData = examsData;
				this.setAssessmentHeader();

				if (this.evaluationData.terms) {
					this.evaluationData.terms.sort((a, b) => b.term - a.term);
				} else {
					this.evaluationData.terms = [];
				}

				this.latestTermID = this.evaluationData?.terms[0]?.term;
				this.setAcademicTerm(this.latestTermID);

				this.isLoadingAssessments = false;
				this.isLoadingAssessmentHeader = false;
			},
			error: (err) => {
				this.isLoadingAssessments = false;
				this.responseHandlerService.error(err, "getExams()");
			}
		});
	}

	private getEvaluations() {
		this.isLoadingAssessments = true;
		if (!this.assessmentHeader) {
			this.isLoadingAssessmentHeader = true;
		}

		this.evaluationService.getEvaluations(this.classId, this.selectedAcademicYearID, this.selectedAcademicTermID).subscribe({
			next: (evaluationData) => {
				this.schoolYear = evaluationData.year;
				this.evaluationData = evaluationData;
				this.setAssessmentHeader();

				if (this.evaluationData.terms) {
					this.evaluationData.terms.sort((a, b) => b.term - a.term);
				} else {
					this.evaluationData.terms = [];
				}

				this.latestTermID = this.evaluationData?.terms[0]?.term;
				this.setAcademicTerm(this.latestTermID);

				this.isLoadingAssessments = false;
				this.isLoadingAssessmentHeader = false;
			},
			error: (err) => {
				this.responseHandlerService.error(err, "getEvaluations()");
				this.isLoadingAssessments = false;
			}
		});
	}

	private setAssessmentHeader() {
		this.assessmentHeader = `${this.evaluationData?.classLevel} ${this.evaluationData?.streamName} - ${this.evaluationData?.subjectName} ${this.assessmentNamePlural}`;
	}

	private setAcademicTerm(termID?: number) {
		this.selectedAcademicTermID = termID || this.selectedAcademicTermID || this.OLEVEL_TERMS[0].value;
	}

	private getAcademicTerms() {
		this.academicTerms = this.OLEVEL_TERMS;
	}

	confirmDelete({ evaluationId }) {
		Swal.fire({
			title: this.translate.instant("evaluation.all.swal.title1"),
			text: this.translate.instant("evaluation.all.swal.text1"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#fb2f00",
			confirmButtonText: this.translate.instant("evaluation.all.swal.confirmButtonText1"),
			cancelButtonText: this.translate.instant("evaluation.all.swal.cancelButtonText1"),
			reverseButtons: true,
		})
			.then((result) => {
				if (result.isConfirmed) {
					if (this.routeState === "project") {
						this.deleteProject(evaluationId);
					} else if (this.routeState === "exam") {
						this.deleteExam(evaluationId);
					} else {
						this.deleteEvaluation(evaluationId);
					}
				}
			});
	}

	async confirmDeleteWithVerification({ term, evaluation, index }) {

		let assessmentName: string;
		if (this.routeState === "project") {
			assessmentName = evaluation.projectName;
		} else {
			assessmentName = evaluation.evaluationName;
		}

		const childComponent = this.componentFactoryResolver.resolveComponentFactory(SweetAlertContentComponent);
		const childComponentRef = this.sweetAlertContent.createComponent(childComponent);

		childComponentRef.instance.assessmentName = assessmentName;
		const nextAssessment = this.getAssessments(term)[index + 1];
		if (nextAssessment && this.routeState !== "project") {
			childComponentRef.instance.nextAssessmentName = nextAssessment.evaluationName;
		}

		const { value: confirmationDetails } = await Swal.fire({
			title: this.translate.instant("evaluation.all.swal.title2"),
			heightAuto: false,
			customClass: {
				htmlContainer: "swal-overflow",
			},
			html: childComponentRef.location.nativeElement,
			icon: "warning",
			confirmButtonText: this.translate.instant("evaluation.all.swal.confirmButtonText1"),
			cancelButtonText: this.translate.instant("evaluation.all.swal.cancelButtonText1"),
			showCancelButton: true,
			reverseButtons: true,
			preConfirm: () => {
				return new Promise((resolve) => {
					// Validate input

					if (childComponentRef.instance.nameInput !== assessmentName) {
						Swal.showValidationMessage(this.translate.instant("evaluation.all.swal.inputValidatorText"));
						Swal.enableButtons();
					} else if (!childComponentRef.instance.nameCheckbox && nextAssessment && this.routeState !== "project") {
						Swal.showValidationMessage(this.translate.instant("evaluation.all.swal.checkboxValidatorText", { previousName: nextAssessment.evaluationName, newName: assessmentName }));
						Swal.enableButtons();
					} else {
						resolve({ evaluationName: childComponentRef.instance.nameInput, confirmed: childComponentRef.instance.nameCheckbox });
					}
				});
			}
		});

		if (confirmationDetails) {
			if (this.routeState == "project") {
				this.deleteProject(evaluation.projectId);
			} else if (this.routeState == "exam") {
				this.deleteExam(evaluation.evaluationId);
			} else {
				this.deleteEvaluation(evaluation.evaluationId);
			}
		}
	}

	getAssessments(term: any) {
		switch (this.routeState) {
		case "evaluation":
			return term.evaluations;
		case "project":
			return term.projects;
		default:
			return term.exams;
		}
	}

	private deleteEvaluation(evaluationId: number) {
		this.evaluationService.deleteEvaluation(evaluationId).subscribe({
			next: () => {
				const message = this.translate.instant("evaluation.all.toastMessages.deleteSuccess");
				this.toastService.success(message);
				this.getEvaluations();
			},
			error: (err) => {
				this.responseHandlerService.error(err, "deleteEvaluation()");
			}
		});
	}

	private deleteExam(examId: number) {
		this.evaluationService.deleteExam(examId).subscribe({
			next: () => {
				const message = this.translate.instant("evaluation.all.toastMessages.deleteExamSuccess");
				this.toastService.success(message);
				this.getExams();
			},
			error: (err) => {
				this.responseHandlerService.error(err, "deleteExam()");
			}
		});
	}

	private deleteProject(projectId: number) {
		this.evaluationService.deleteProject(projectId).subscribe({
			next: () => {
				const message = this.translate.instant("evaluation.all.toastMessages.deleteProjectSuccess");
				this.toastService.success(message);
				this.getProjects();
			},
			error: (err) => {
				this.responseHandlerService.error(err, "deleteProject()");
			}
		});
	}

	get selectedYear() {
		let selectedYear;
		this.academicYears.forEach(year => {
			if (year.ayid == this.selectedAcademicYearID) {
				selectedYear = year.name;
			}
		});
		return selectedYear;
	}

	onAcademicYearChange(academicYearID: number) {
		this.selectedAcademicYearID = academicYearID;
		this.evaluationData = null!;
		this.retrieveAssessments();
	}

	onAcademicTermChange(termID: number) {
		this.selectedAcademicTermID = termID;
		this.retrieveAssessments();
	}

	navigateBack() {
		this.router.navigate(["/main/classes/myclass"]);
	}

	navigateToEvaluationReport(term: number, selectedAcademicYearID: number) {
		const queryParams: Params = {
			class: this.classId,
			term: term,
			acyr: selectedAcademicYearID,
		};

		if (!this.userRoles?.isSchoolAdmin)	queryParams["hideClassList"] = true;

		this.router.navigate(["/main/printouts/olevels/evaluation-report"], { queryParams } );
	}

	handleSuccessModalResult(data: {result: "isDismissed" | "isConfirmed", evaluationId: number, assessmentType: number,}) {
		if (data.result === "isDismissed") {
			this.retrieveAssessments();
		} else if (data.result === "isConfirmed") {
			this.navigateToAssessmentUploadPage(data.evaluationId, data.assessmentType);
		}
	}

	private navigateToAssessmentUploadPage(evaluationId: number, assessmentType: number) {
		let paramValue = "";

		if (assessmentType == 0) {
			paramValue = "exam";
		}else if (assessmentType == 1) {
			paramValue = "evaluation";
		}else if (assessmentType == 2) {
			paramValue = "project";
		}

		this.router.navigate(["main/evaluation/upload/"+evaluationId], {queryParams: {class: this.classId, type: paramValue, str: this.streamId}});
	}

	ngOnDestroy() {
		this.destroyed$.next(true);
		this.destroyed$.unsubscribe();
		this.classNameSub?.unsubscribe();
	}
}
