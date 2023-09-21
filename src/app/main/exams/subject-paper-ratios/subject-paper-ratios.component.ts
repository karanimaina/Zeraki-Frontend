import { Component, OnDestroy, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SubjectPaperService } from "../manage-exam/config-exam/services/subject-paper.service";
import { ResponseHandlerService } from "../../../@core/shared/services/response-handler/response-handler.service";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
	selector: "app-subject-paper-ratios",
	templateUrl: "./subject-paper-ratios.component.html",
	styleUrls: ["./subject-paper-ratios.component.scss"],
})
export class SubjectPaperRatiosComponent implements OnInit, OnDestroy {
	private destroy$: Subject<boolean> = new Subject<boolean>();
	subjectPaperRatiosFormGroup!: FormGroup;
	subjectPapers: number[] = [];
	subjectPaperRatios!: any;
	editSubjectPaperRatioRow: { [key: number]: boolean } = {};
	isLoadingSPRatios = false;
	updatingSubjectPaperPresetRow: { [key: number]: boolean } = {};
	constructor(
		private rolesService: RolesService,
		private subjectPaperService: SubjectPaperService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private formBuilder: FormBuilder
	) {}

	ngOnInit(): void {
		this.loadSubjectPaperRatios();
		this.getUserRoles();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	userRoles: any = {};
	getUserRoles(): void {
		this.rolesService.roleSubject.subscribe((userRoles) => {
			this.userRoles = userRoles;
		});
	}

	loadSubjectPaperRatios() {
		this.isLoadingSPRatios = true;
		this.subjectPaperService
			.getSubjectPaperPresets()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoadingSPRatios = false))
			)
			.subscribe(
				(res) => {
					this.subjectPaperRatios = res || [];
					this.subjectPapers = Object.keys(this.subjectPaperRatios[0])
						.filter((key) => key.includes("Ratio"))
						.map((key, index) => index + 1);
					this.initializeSubjectPaperRatiosFormGroup();
				},
				(err) => {
					this.responseHandler.error(err, "loadSubjectPaperRatios");
				}
			);
	}

	initializeSubjectPaperRatiosFormGroup() {
		this.subjectPaperRatiosFormGroup = this.formBuilder.group({
			subjectPaperRatios: this.formBuilder.array([]),
		});

		this.populateSubjectPaperRatiosFormArray();
	}

	populateSubjectPaperRatiosFormArray() {
		this.subjectPaperRatiosFormArray.clear();
		this.subjectPaperRatios.forEach((subjectPaperRatio) => {
			const formKeysAndValues = {};

			Object.keys(subjectPaperRatio).forEach((key) => {
				if (key.includes("paper")) {
					formKeysAndValues[key] = [
						subjectPaperRatio[key],
						[Validators.max(100), Validators.min(0)],
					];
				}
			});

			formKeysAndValues["subject"] = [subjectPaperRatio["subjectId"]];

			this.subjectPaperRatiosFormArray.push(
				this.formBuilder.group(formKeysAndValues)
			);
		});
	}

	private get subjectPaperRatiosFormArray() {
		return this.subjectPaperRatiosFormGroup.get(
			"subjectPaperRatios"
		) as FormArray;
	}

	enableEditSubjectPaperPreset(subjectId: number) {
		this.editSubjectPaperRatioRow[subjectId] =
			!this.editSubjectPaperRatioRow[subjectId];
	}

	saveEditPaperPreset(index: number) {
		const subjectPaperForm = this.subjectPaperRatiosFormArray.controls[index];

		if (subjectPaperForm.invalid) {
			return;
		}

		// Check if there are any changes
		const subjectPaperRatio = this.subjectPaperRatios[index];
		const formKeys = Object.keys(subjectPaperRatio);
		let hasChanges = false;

		formKeys.forEach((key) => {
			if (
				key.includes("paper") &&
				subjectPaperRatio[key] !== subjectPaperForm.value[key]
			) {
				hasChanges = true;
			}
		});

		if (!hasChanges) {
			const errorMsg = this.translate.instant(
				"exams.subjectPaperRatios.toastMessages.noChangesMadeWarning"
			);
			this.toastService.warning(errorMsg);
			return;
		}

		this.submitEditPaperPresets(subjectPaperForm.value);
	}

	submitEditPaperPresets(subjectPaperPresetsForm) {
		this.updatingSubjectPaperPresetRow[subjectPaperPresetsForm.subject] = true;

		this.subjectPaperService
			.saveDefaultPaperRatios(subjectPaperPresetsForm)
			.pipe(
				finalize(
					() =>
						(this.updatingSubjectPaperPresetRow[
							subjectPaperPresetsForm.subject
						] = false)
				)
			)
			.subscribe(
				(res) => {
					this.responseHandler.success(res);
					this.enableEditSubjectPaperPreset(subjectPaperPresetsForm.subject);
					this.loadSubjectPaperRatios();
				},
				(err) => {
					this.responseHandler.error(err, "submitPaperPresets()");
				}
			);
	}
}
