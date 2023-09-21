import {
	Component,
	OnInit,
	Input,
	ViewChild,
	ElementRef,
	Renderer2,
	EventEmitter,
	Output,
	OnDestroy
} from "@angular/core";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ResponseHandlerService } from "../../../../@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-edit-exam",
	templateUrl: "./edit-exam.component.html",
	styleUrls: ["./edit-exam.component.scss"]
})
export class EditExamComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();
	@ViewChild("examNameInput") editExamInput!: ElementRef;
	@Input() selectedExamForEdit: any;
	@Input() forms: any;
	@Input() schoolData?: SchoolTypeData | null;
	@Output() editing = new EventEmitter<any>();

	editExamName = false;
	routeParams: any;
	isAddIntakeView = false;
	isEditExam = false;
	examNameForm: FormGroup = new FormGroup({
		name: new FormControl({ value: "", disabled: true }, Validators.required)
	});
	isSubmitted = false;
	loading = false;

	seriesId?: number;
	egroupId?: number;
	examName?: string;

	constructor(
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private route: ActivatedRoute,
		private renderer: Renderer2,
		private responseHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		// this.selectedExam = this.examService.getConfigSelectedExam();
		this.selectedExamForEdit.name_temp = this.selectedExamForEdit?.name;
		this.route.params.subscribe((p) => {
			this.routeParams = p;
		});

		this.examNameForm.setValue({
			name: this.selectedExamForEdit.name
		});
	}

	get f(): { [key: string]: AbstractControl } {
		return this.examNameForm.controls;
	}

	editExamToggle() {
		this.editExamName = !this.editExamName;
		// (this.editExamName == true) ? this.selectedExam.examname_temp = this.selectedExam.examname : this.selectedExam.examname_temp = '';
	}

	addIntakeView() {
		this.isAddIntakeView = true;
	}

	closeAddIntakeView() {
		this.isAddIntakeView = false;
	}

	initEditExam() {
		this.isEditExam = true;
		//Enable the input field
		this.examNameForm.controls["name"].enable();
		//Focus cursor on the input field
		this.renderer.selectRootElement(this.editExamInput.nativeElement).focus();
	}

	updateExamName() {
		this.isSubmitted = true;
		if (this.examNameForm.invalid) {
			return;
		}
		this.examName = this.examNameForm.value.name;
		const selectedExam = this.selectedExamForEdit;
		this.seriesId = selectedExam.seriesid;
		this.egroupId = selectedExam.egroupid;

		if (this.selectedExamForEdit.name == this.examName) {
			const errorMsg = this.translate.instant("exams.editExams.toastMessages.examNotChangedWarning");
			this.toastService.info(errorMsg);
		} else {
			this.loading = true;

			this.editExam();
		}
	}

	editExam() {
		const urlParams = new URLSearchParams();
		this.seriesId? urlParams.set("seriesid", `${this.seriesId}`): urlParams.set("egroupId", `${this.egroupId}`);
		urlParams.set("name", `${this.examName}`);

		const editObservable = this.seriesId? this.examService.editSeriesExamName(urlParams): this.examService.editEgroupExamName(urlParams);

		editObservable.pipe(
			takeUntil(this.destroy$),
			finalize(() => this.loading = false))
			.subscribe((resp) => {
				this.examNameForm.controls["name"].disable();

				this.responseHandler.success(resp);

				this.selectedExamForEdit.name = this.examName;
				this.isEditExam = false;
			}, (err) => {
				this.responseHandler.error(err, "editSeriesExam()");
			});
	}

	filterAddedIntakes(intakeIds: number[]) {
		this.forms = this.forms.filter((form) => !intakeIds.includes(form.intakeid));
	}

	back() {
		this.editing.emit(false);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
