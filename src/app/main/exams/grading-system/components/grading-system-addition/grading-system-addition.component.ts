import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormGroup,  Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { GradingSystem } from "src/app/@core/models/exams/grading-system";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { gradeAlphaNumbericValidator, gradeValidator } from "src/app/@core/shared/directives/grade-validator.directive";
import { GradingSystemService } from "src/app/@core/shared/services/exams/grading-system.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-grading-system-addition",
	templateUrl: "./grading-system-addition.component.html",
	styleUrls: ["./grading-system-addition.component.scss"]
})
export class GradingSystemAdditionComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	@Input() schoolData?: SchoolTypeData;
	@Output() onGradingSystemCreationSuccess: EventEmitter<void> = new EventEmitter<void>();

	showGSsample = false;
	gradingSystemCreationForm!: FormGroup;
	creatingGradingSystem = false;

	showTzOlevel = true;
	showTzAlevel = false;

	constructor(
    private translate: TranslateService,
		private fb: FormBuilder,
		private examService: ExamService,
		private mentionService: MentionService,
		private responseHandler: ResponseHandlerService,
    private toastService: HotToastService,
    private gradingSystemService: GradingSystemService,
	) { }

	ngOnInit(): void {
		this.initializeGradingSystemCreationForm();
	}

	private initializeGradingSystemCreationForm() {
		this.gradingSystemCreationForm = this.fb.group({
			name: ["", Validators.required],
			gradingSystems: this.fb.array([])
		});

		this.activeSchoolGradingSystem.forEach((gradingSystemItem) => {
			const payload: GradingSystem = {
				low: null,
				high: null,
				grade: gradingSystemItem.grade,
				points: gradingSystemItem?.points,
				gpa: gradingSystemItem?.gpa,
				comment: "",
				mention: "",
				comments: "",
				description: gradingSystemItem?.description
			};

			if (this.isMentionSchools) {
				payload["grade"] = "";

				delete payload["points"];
				delete payload["gpa"];
				delete payload["description"];
			}

			this.addGradingSystemFormGroup(payload);
		});
	}

	get activeSchoolGradingSystem() {
		return this.gradingSystemService.getActiveSchoolGradingSystem(this.schoolData, this.showTzOlevel, this.showTzAlevel);
	}

	addGradingSystemFormGroup(gradingSystem?: GradingSystem) {
		const emptyGradingSystem: GradingSystem = {
			low: null,
			high: null,
			grade: "",
			points: undefined,
			gpa: undefined,
			comment: "",
			mention: "",
			comments: "",
			description: "",
		};

		const { low, high, grade, points, gpa, comment, mention, comments, description } = gradingSystem ?? emptyGradingSystem;

		const controlsConfig: { [key: string]: any; } = {
			low: [low, Validators.required],
			high: [high, Validators.required],
			grade: [grade, this.gradeValidators],
			points: [points, this.pointsValidators],
			gpa: [gpa, this.gpaValidators],
			comment: [comment],
			description: [description, this.descriptionValidators],
		};

		const mentionSchoolsControlsConfig: { [key: string]: any; } = {
			low: [low, Validators.required],
			high: [high, Validators.required],
			mention: [mention, Validators.required],
			comments: [comments, Validators.required],
		};

		const newGroup = this.fb.group(this.isMentionSchools ? mentionSchoolsControlsConfig : controlsConfig);
		this.gradingSystemsFormArray.push(newGroup);

		// Add dynamic validation for high and low
		const index = this.gradingSystemsFormArray.controls.indexOf(newGroup);
		newGroup.get("low")?.valueChanges.subscribe(() => {
			this.updateRangeValidation(index);
			this.updateRangeValidation(index + 1);
		});
		newGroup.get("high")?.valueChanges.subscribe(() => {
			this.updateRangeValidation(index);
			this.updateRangeValidation(index + 1);
		});
	}

	private get pointsValidators() {
		if(this.isGhanaSchool)
			return [];
		return [Validators.required];
	}

	private get gpaValidators() {
		if(this.isZimbabweSchool || this.isZambiaSchool)
			return [Validators.required];
		return [];
	}

	private get descriptionValidators() {
		if(this.isZambiaSchool || this.isGhanaSchool)
			return [Validators.required];
		return [];
	}

	private get gradeValidators() {
		if(this.isZambiaSchool || this.isGhanaSchool)
			return [Validators.required, gradeAlphaNumbericValidator];
		return [Validators.required, gradeValidator];
	}

	private updateRangeValidation(index: number) {
		const group = this.gradingSystemsFormArray.controls[index] as FormGroup;

		if (!group) return;

		const lowControl = group.get("low");
		const highControl = group.get("high");

		const prevGroup = this.gradingSystemsFormArray.controls[index - 1] as FormGroup;
		const prevHighControl = prevGroup ? prevGroup.get("high") : null;

		const lowValue = parseInt(lowControl?.value, );
		const prevHighValue = prevHighControl ? parseInt(prevHighControl.value) : null;

		/*
		 * If the previous group exists, the low value of the current group must be greater or equal to the high value of the previous group
		 * and it must be less than the high value of the previous group + 1, else it must be 0
		 */
		lowControl?.setValidators(Validators.compose([
			Validators.required,
			Validators.min(prevHighValue || 0),
			Validators.max(prevHighValue ? prevHighValue + 1 : 0)]));
		lowControl?.updateValueAndValidity({emitEvent: false});

		/*
		 * If previous group exists, the high value of the current group must be greater than the high value of the previous group,
		 * else it must be greater than the low value of the current group, and it must be less than or equal to the `max` value set below.
		 * The last high value's min validation is also set to the `max`.
		 */
		const max = (this.isMentionSchools && !this.isSouthAfricanSchool) ? 20 : 100;
		const isLastItem = index === (this.gradingSystemsFormArray.controls.length - 1);
		let min = isLastItem ? max : (prevHighValue ? prevHighValue + 1 : lowValue + 1);

		if(this.isMentionSchools)
			min = prevHighValue ? prevHighValue + 1 : lowValue + 1;

		highControl?.setValidators(Validators.compose([
			Validators.required,
			Validators.min(min),
			Validators.max(max)]));
		highControl?.updateValueAndValidity({emitEvent: false});
	}

	get gradingSystemsFormArray() {
		return this.gradingSystemCreationForm.get("gradingSystems") as FormArray;
	}

	removeGradingSystemFormGroup(index: number) {
		const isLastItem = index === (this.gradingSystemsFormArray.controls.length - 1);

		this.gradingSystemsFormArray.removeAt(index);

		if (isLastItem) {
			this.updateRangeValidation(index - 1);
		} else {
			this.updateRangeValidation(index);
		}
	}

	async copyGradingSystem() {
		const result = await Swal.fire({
			title: this.translate.instant("exams.gradingSystem.swal.notice"),
			text: this.translate.instant("exams.gradingSystem.swal.noticeText"),
			icon: "warning",
			showCancelButton: true,
		});

		if (result.isConfirmed) {
			this.gradingSystemsFormArray.clear();

			this.activeSchoolGradingSystem.forEach((gradingSystemItem) => {
				const payload: GradingSystem = {
					low: gradingSystemItem.low,
					high: gradingSystemItem.high,
					grade: gradingSystemItem.grade,
					points: gradingSystemItem?.points,
					gpa: gradingSystemItem?.gpa,
					comment: "",
					description: gradingSystemItem?.description,
				};

				if (this.isMentionSchools) {
					payload["grade"] = "";
					payload["mention"] = gradingSystemItem.mention;
					payload["comments"] = gradingSystemItem.comments;

					delete payload["points"];
					delete payload["gpa"];
					delete payload["description"];
				}

				this.addGradingSystemFormGroup(payload);
			});

			this.toggleGradingSystemSampleDisplay();
		}
	}

	toggleGradingSystemSampleDisplay() {
		this.showGSsample = !this.showGSsample;
	}

	saveGradingSystem() {
		const form: FormGroup = this.gradingSystemCreationForm;
		if (form.invalid) {
			const message = this.translate.instant("exams.gradingSystem.toastMessages.addError");
			this.responseHandler.error({ message }, "saveGradingSystem()");
			return;
		}

		const duplicateGradingSystem = this.findDuplicateGradingSystems(form.value.gradingSystems, this.isMentionSchools ? "mention" : "grade");
		if (duplicateGradingSystem) {
			this.toastService.warning(this.translate.instant(
				this.isMentionSchools ? "exams.gradingSystem.toastMessages.repeatedMentionWarning" : "exams.gradingSystem.toastMessages.repeatedGradeWarning",
				{ grade: duplicateGradingSystem.toUpperCase() }
			));

			return;
		}

		let gradingSystemListPresets: any = [];

		if (this.isMentionSchools) {
			gradingSystemListPresets = form.value.gradingSystems;
		} else {
			gradingSystemListPresets = form.value.gradingSystems.map((item: any) => {
				return {
					grade: item.grade.trim().toUpperCase(),
					low: parseInt(item.low),
					high: parseInt(item.high),
					points: parseInt(item.points),
					gpa: (item.gpa || item.gpa === 0) ? Number(item.gpa) : null,
					description: item?.description?.trim(),
				};
			});
		}

		if (gradingSystemListPresets.length < 2) {
			const message = this.translate.instant(this.isMentionSchools ? "exams.gradingSystem.toastMessages.atLeastTwoMentionsWarning" : "exams.gradingSystem.toastMessages.atLeastTwoGradesWarning");
			this.responseHandler.warn({ message }, "saveGradingSystem()");
			return;
		}

		this.persistGradingSystem(form.value["name"], gradingSystemListPresets);
	}

	private findDuplicateGradingSystems(form: any[], gradekey: "mention" | "grade"): string {
		const gradingSystems: string[] = [];
		const duplicates: string[] = [];

		form.forEach((item) => {
			if (gradingSystems.includes(item[gradekey].toLowerCase())) {
				if (!duplicates.includes(item[gradekey].toLowerCase())) {
					duplicates.push(item[gradekey].toLowerCase());
				}
			} else {
				gradingSystems.push(item[gradekey].toLowerCase());
			}
		});

		switch (duplicates.length) {
		case 0:
			return "";
		case 1:
			return duplicates[0];
		default:
			return duplicates.join(", ");
		}
	}

	private persistGradingSystem(gradingSystemName: string, gradingSystemListPresets: any[]) {
		let gradingSystemCreation$: Observable<any>;
		if (this.isMentionSchools) {
			gradingSystemCreation$ = this.mentionService.addMention(gradingSystemName, gradingSystemListPresets);
		} else {
			gradingSystemCreation$ = this.examService.addGradingSystem(gradingSystemListPresets, gradingSystemName);
		}

		this.creatingGradingSystem = true;

		gradingSystemCreation$
			.pipe(takeUntil(this.destroy$), finalize(() => this.creatingGradingSystem = false))
			.subscribe({
				next: (response) => {
					this.responseHandler.success(response, "persistGradingSystem()");
					this.onGradingSystemCreationSuccess.emit();
				},
				error: (err) => this.responseHandler.error(err, "persistGradingSystem()"),
			});
	}

	get isSouthAfricanSchool() {
		return this.schoolData?.isSouthAfricaPrimarySchool || this.schoolData?.isSouthAfricaSecondarySchool;
	}

	get isMentionSchools() {
		return this.schoolData?.isGuineaSchool || this.schoolData?.isIvorianSchool || this.isSouthAfricanSchool;
	}

	get isZimbabweSchool() {
		return this.schoolData?.isZimbabwePrimarySchool || this.schoolData?.isZimbabweSecondarySchool || this.schoolData?.isZimbabweIgcse;
	}

	get isGhanaSchool() {
		return (
			this.schoolData?.isGhanaJuniorSchool ||
			this.schoolData?.isGhanaPrimarySchool ||
			this.schoolData?.isGhanaPrimaryJuniorSchool ||
			this.schoolData?.isGhanaSeniorSchool
		);
	}

	get isZambiaSchool() {
		return this.schoolData?.isZambiaPrimarySchool || this.schoolData?.isZambiaSecondarySchool;
	}

	onTzSecondaryOptionChange(event: any) {
		if (event.target.value === "tzOlevel") {
			this.showTzOlevel = true;
			this.showTzAlevel = false;
		} else {
			this.showTzOlevel = false;
			this.showTzAlevel = true;
		}
	}

	get showPoints() {
		return !this.schoolData?.isTanzaniaPrimary && !this.isGhanaSchool;
	}

	get showGPA() {
		return this.isZimbabweSchool || this.isZambiaSchool || this.isGhanaSchool;
	}

	get showDescription() {
		return this.isZambiaSchool || this.isGhanaSchool;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.complete();
	}

}
