import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
} from "@angular/core";
import { Paper, PaperStatus, SubjectPapers } from "../../models/subject-papers";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ResponseHandlerService } from "../../../../../../@core/shared/services/response-handler/response-handler.service";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import Swal from "sweetalert2";
import { SubjectPaperService } from "../../services/subject-paper.service";
import { SubjectPaperPresets } from "src/app/@core/models/exams/subject-paper-ratio";

@Component({
	selector: "app-subject-papers-table",
	templateUrl: "./subject-papers-table.component.html",
	styleUrls: ["./subject-papers-table.component.scss"],
})
export class SubjectPapersTableComponent implements OnInit, OnChanges {
	@Input() subjectPaperPresetsMap!: Map<number, SubjectPaperPresets>;
	@Input() subjectPapers: SubjectPapers[] = [];
	@Input() addable = true;
	@Input() intakeId!: number;
	@Input() seriesId!: number;
	@Input() enableAllSubjectPapers = true;

	@Output() subjectPapersUpdated: EventEmitter<void> = new EventEmitter<void>();

	paperStatus = PaperStatus;
	subjectPapersFormGroup!: FormGroup;
	editableRows: { [key: number]: boolean } = {};
	constructor(
		private formBuilder: FormBuilder,
		private subjectPaperService: SubjectPaperService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private translate: TranslateService
	) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.subjectPapers?.currentValue) {
			this.initSubjectsFormArray();
		}
	}

	private initSubjectsFormArray() {
		this.subjectPapersFormGroup = this.formBuilder.group({
			subjects: this.formBuilder.array([]),
		});
		this.populateSubjectsFormArray();
	}

	populateSubjectsFormArray() {
		this.subjectsFormArray.clear();
		this.subjectPapers.forEach((subjectPaper) => {
			const subjectFormGroup = this.formBuilder.group({
				subjectId: subjectPaper.subjectId,
				papers: this.formBuilder.array(
					this.getPaperFormGroups(subjectPaper.papers)
				),
			});

			this.subjectsFormArray.push(subjectFormGroup);
		});
	}

	private get subjectsFormArray() {
		return this.subjectPapersFormGroup.get("subjects") as FormArray;
	}

	private getPaperFormGroups(papers: Paper[]) {
		return papers.map((paper) => {
			return this.formBuilder.group({
				paperId: paper.paperId,
				paperName: paper.paperName,
				ratio: {
					value: paper.ratio,
					disabled: paper.status === PaperStatus.UNSET,
				},
				status: {
					value: paper.status == PaperStatus.UNSET ? 0 : paper.status,
					disabled: paper.status === PaperStatus.UNSET,
				},
				maxMarks: paper.maxMarks,
			});
		});
	}

	editSubjectPaperRow(subjectId: number) {
		this.editableRows[subjectId] = !this.editableRows[subjectId];
	}

	getUpdatedPapers(subjectPaperIndex: number) {
		const subjectPaperFormGroup = this.subjectsFormArray.at(
			subjectPaperIndex
		) as FormGroup;

		const subjectId = subjectPaperFormGroup.get("subjectId")?.value;

		const papersFormArray = subjectPaperFormGroup.get("papers") as FormArray;
		const papersPayload = papersFormArray.controls.map((paperFormGroup) => {
			const paper = paperFormGroup.value as Paper;

			const paperPayload = {
				paperName: paper.paperName,
				ratio: paper.ratio,
				status: paper.status ? PaperStatus.ACTIVE : PaperStatus.DISABLED,
			};

			if (paper.paperId) {
				return {
					...paperPayload,
					paperId: paper.paperId,
				};
			}

			return paperPayload;
		});
		this.confirmSaveOfSubjectPaperChanges(subjectId, papersPayload);
	}

	private confirmSaveOfSubjectPaperChanges(
		subjectId: number,
		papersPayload: any[]
	) {
		const papersToBeDeleted = papersPayload.filter(
			(paper) => paper.status === PaperStatus.DISABLED && paper["paperId"]
		);
		const papersToBeAdded = papersPayload.filter(
			(paper) => paper.status === PaperStatus.ACTIVE
		);

		if (papersToBeDeleted.length === 0 && papersToBeAdded.length === 0) {
			this.editableRows[subjectId] = false;
			return;
		}

		const hasZeroRatio = papersPayload.some(
			(paper) => paper.ratio <= 0 && paper.status === PaperStatus.ACTIVE
		);
		if (hasZeroRatio) {
			this.toastService.warning(
				this.translate.instant(
					"exams.configExam.toastMessages.savePapersForm.invalidRatios"
				)
			);
			return;
		}

		Swal.fire({
			title: this.translate.instant("common.swal.titleConfirmAction"),
			text: this.translate.instant("exams.configExam.swal.textSavePaperRatio"),
			icon: "info",
			showCancelButton: true,
			cancelButtonColor: "#2196F3",
			cancelButtonText: this.translate.instant(
				"exams.configExam.swal.cancelButtonText"
			),
			confirmButtonColor: "#DC3545",
			confirmButtonText: this.translate.instant(
				"exams.configExam.swal.confirmButtonText"
			),
		}).then((result) => {
			if (result.isConfirmed) {
				this.saveSubjectPapersChanges(
					subjectId,
					papersToBeAdded,
					papersToBeDeleted
				);
			} else {
				Swal.fire({
					title: this.translate.instant(
						"exams.configExam.swal.titleSavePaperRatio2"
					),
					text: this.translate.instant(
						"exams.configExam.swal.textSavePaperRatio2"
					),
					icon: "info",
					showCancelButton: true,
				}).then((isConfirm) => {
					if (isConfirm.isConfirmed) {
						this.saveSubjectPapersChanges(
							subjectId,
							papersToBeAdded,
							papersToBeDeleted
						);
						this.saveDefaultPaperRatios(subjectId, papersPayload);
					}
				});
			}
		});
	}

	private saveSubjectPapersChanges(
		subjectId,
		papersToBeAdded,
		papersToBeDeleted
	) {
		forkJoin([
			...this.deleteSubjectPapers(subjectId, papersToBeDeleted),
			this.addSubjectPapers(subjectId, papersToBeAdded),
		])
			.pipe(
				map((res) => res.filter((request) => request && request.failed).length)
			)
			.subscribe(
				(failedRequests) => {
					if (failedRequests === 0) {
						const message = this.translate.instant(
							"exams.configExam.toastMessages.papersModifiedSuccess"
						);
						this.toastService.success(message);
						this.editableRows[subjectId] = false;

						this.subjectPapersUpdated.emit();
					}
				},
				(error) => {
					this.responseHandler.error(error, "updateSubjectPapers()");
				}
			);
	}

	private deleteSubjectPapers(subjectId: number, papersToBeDeleted: any[]) {
		return papersToBeDeleted.map((paper) => {
			return this.subjectPaperService.deleteSubjectPaper(paper.paperId).pipe(
				catchError((error) => {
					this.responseHandler.error(error, "deleteSubjectPapers()");
					return of({ failed: true });
				})
			);
		});
	}

	private addSubjectPapers(subjectId: number, papersToBeAdded: any[]) {
		return papersToBeAdded.length > 0
			? this.subjectPaperService
				.addSubjectPaper(
					this.intakeId,
					this.seriesId,
					subjectId,
					papersToBeAdded
				)
				.pipe(
					catchError((error) => {
						this.responseHandler.error(error, "addSubjectPapers()");
						return of({ failed: true });
					})
				)
			: of(null);
	}

	private saveDefaultPaperRatios(subjectId: number, papersPayload: any[]) {
		const subjectPaperPreset = this.subjectPaperPresetsMap.get(subjectId);

		if (!subjectPaperPreset) return;

		for (let paperIndex = 1; paperIndex <= papersPayload.length; paperIndex++) {
			if (paperIndex >= 3) {
				const subjectPaper = this.subjectPapers.find(
					(subjectPaper) => subjectPaper.subjectId === subjectId
				);
				if (subjectPaper)
					subjectPaperPreset[`paper${paperIndex}Ratio`] =
						subjectPaper.papers[paperIndex - 1].ratio == null
							? null
							: papersPayload[paperIndex - 1].ratio;
			} else {
				subjectPaperPreset[`paper${paperIndex}Ratio`] =
					papersPayload[paperIndex - 1].ratio;
			}
		}

		subjectPaperPreset["subject"] = subjectId;

		this.subjectPaperService
			.saveDefaultPaperRatios(subjectPaperPreset)
			.subscribe(
				() => {
					const message = this.translate.instant(
						"exams.configExam.toastMessages.newDefaultsSavedSuccess"
					);
					this.toastService.success(message);
				},
				() => {
					const message = this.translate.instant(
						"exams.configExam.toastMessages.saveForDefaultPaperErrorRatiosError"
					);
					this.toastService.error(message);
				}
			);
	}

	confirmEnableOfAllSubjectPapers() {
		Swal.fire({
			title: this.translate.instant("common.swal.titleConfirmAction"),
			text: this.translate.instant("exams.configExam.swal.textSavePaperRatio3"),
			icon: "info",
			showCancelButton: true,
			cancelButtonColor: "#2196F3",
			cancelButtonText: this.translate.instant(
				"common.swal.cancelButtonTextCancel"
			),
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextProceed"
			),
		}).then((result) => {
			if (result.isConfirmed) {
				this.updateAllSubjectPapers("enable");
			}
		});
	}

	confirmDisableOfAllSubjectPapers() {
		Swal.fire({
			title: this.translate.instant("common.swal.titleConfirmAction"),
			text: this.translate.instant(
				"exams.configExam.swal.textDisablePaperRatio3"
			),
			icon: "info",
			showCancelButton: true,
			cancelButtonColor: "#2196F3",
			cancelButtonText: this.translate.instant(
				"common.swal.cancelButtonTextCancel"
			),
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextProceed"
			),
		}).then((result) => {
			if (result.isConfirmed) {
				this.updateAllSubjectPapers("disable");
			}
		});
	}

	private updateAllSubjectPapers(status: "enable" | "disable") {
		const subjectPapers = this.subjectPapers
			.filter((subjectPaper) => subjectPaper.hasDefaultPaperPresets)
			.map((subjectPaper) => {
				return {
					subjectId: subjectPaper.subjectId,
					subjectPapers: subjectPaper.papers.map((paper) => {
						return {
							paperId: paper.paperId || null,
							paperName: paper.paperName,
							ratio: paper.ratio,
							status: PaperStatus.ACTIVE,
						};
					}),
				};
			});

		let updateAllSubjectPapers$;
		if (status == "enable")
			updateAllSubjectPapers$ = this.subjectPaperService.enableAllSubjectPapers(
				this.intakeId,
				this.seriesId,
				subjectPapers
			);
		else
			updateAllSubjectPapers$ =
				this.subjectPaperService.disableAllSubjectPapers(
					this.intakeId,
					this.seriesId,
					subjectPapers
				);

		updateAllSubjectPapers$.subscribe(
			(result) => {
				this.responseHandler.success(result);
				this.subjectPapersUpdated.emit();
			},
			(error) => {
				this.responseHandler.error(error, "enableAllSubjectPapers()");
			}
		);
	}
}
