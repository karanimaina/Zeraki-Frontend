import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-grading-system-list",
	templateUrl: "./grading-system-list.component.html",
	styleUrls: ["./grading-system-list.component.scss"]
})
export class GradingSystemListComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	@Input() isMentionSchool?: boolean = false;

	schoolData?: SchoolTypeData;

	gradingSystems: any[] = [];
	isLoadingGradingSystems = true;

	listGradingSystems = true;
	viewGradingSystem = false;
	selectedGs: any = {};

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private mentionService: MentionService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
	) {}

	ngOnInit(): void {
		this.loadSchoolData();
	}

	private loadSchoolData() {
		this.dataService.schoolData.subscribe((res) => {
			this.schoolData = res;
			this.loadGradingSystems();
		});
	}

	private loadGradingSystems(): void {
		let gradingSystemList$: Observable<any>;
		if (this.isMentionSchool) {
			gradingSystemList$ = this.mentionService.getMentionsMapping();
		} else {
			gradingSystemList$ = this.examService.getGradeMapping();
		}

		this.isLoadingGradingSystems = true;

		gradingSystemList$
			.pipe(finalize(() => this.isLoadingGradingSystems = false), takeUntil(this.destroy$))
			.subscribe({
				next: (res) =>	this.gradingSystems = res ?? [],
				error: (err) =>	this.responseHandler.error(err, "loadGradingSystems()"),
			});
	}

	viewGs(gradingSystem: any) {
		this.selectedGs = gradingSystem;

		// sorting the grades
		const gradesMappingsKey: "gmapping" | "mentionMappings" = this.isMentionSchool ? "mentionMappings" : "gmapping";
		this.selectedGs[gradesMappingsKey].sort((a: any, b: any) => {
			return this.schoolData?.isTanzaniaSecondary ? (a.points - b.points) : (b.high - a.high);
		});

		this.listGradingSystems = false;
		this.viewGradingSystem = true;
	}

	displayGradingSystemList() {
		this.listGradingSystems = true;
		this.viewGradingSystem = false;
	}

	async deleteGradingSystemConfirmation(gradingSystem: any, index: number) {
		let title = this.translate.instant("exams.gradingSystem.swal.titleDelete");
		let text = this.translate.instant("exams.gradingSystem.swal.textDelete", { title: gradingSystem.title });

		if (this.isMentionSchool) {
			title = this.translate.instant("exams.mentions.deleteMention",{ mention: this.schoolData?.mentionLabel });
			text = this.translate.instant("exams.mentions.confirmDeleteMentionText", { mention: gradingSystem.title, mentionTxt: this.schoolData?.mentionLabel });
		}

		const result = await Swal.fire({
			title,
			text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
		});

		if (result.isConfirmed) this.deleteGradingSystem({ gradingSystem, index });
	}

	private deleteGradingSystem({ gradingSystem, index }: { gradingSystem: any, index: number }) {
		let gradingSystemDeletion$: Observable<any>;
		if (this.isMentionSchool) {
			gradingSystemDeletion$ = this.mentionService.deleteMention(gradingSystem.mentionSystemId);
		} else {
			gradingSystemDeletion$ = this.examService.deleteGradingSystem(gradingSystem.gsid);
		}

		gradingSystem.isRemoving = true;

		gradingSystemDeletion$
			.pipe(takeUntil(this.destroy$), finalize(() => gradingSystem.isRemoving = false))
			.subscribe({
				next: (res) => {
					this.gradingSystems.splice(index, 1);
					this.responseHandler.success(res, "deleteGradingSystem()");
				},
				error: (err) => this.responseHandler.error(err, "deleteGradingSystem()"),
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
