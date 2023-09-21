import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from "@angular/core";
import {combineLatest, Observable} from "rxjs";
import { map} from "rxjs/operators";
import {SchoolIntake, SchoolStream} from "../../../../../../@core/models/school-type-data";
import {OlevelAcademicYear} from "../../../../../../@core/models/olevel/olevel-academic-year";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataService} from "../../../../../../@core/shared/services/data/data.service";
import {EvaluationService} from "../../../../../../@core/services/exams/evaluations/evaluation.service";
import {TermExam} from "../../../models/term-exam";

@Component({
	selector: "app-olevel-transcripts-form",
	templateUrl: "./olevel-transcripts-form.component.html",
	styleUrls: ["./olevel-transcripts-form.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OlevelTranscriptsFormComponent implements OnInit {
	@Output() onFormSubmit: EventEmitter<any> = new EventEmitter<any>();
	formOrYear$: Observable<string> = this.dataService.schoolData.pipe(map(data => data?.formoryear));
	currentFormList$: Observable<SchoolIntake[]> = this.dataService.schoolData.pipe(map(data => data?.current_forms_list));
	currentStreamList$: Observable<SchoolStream[]> = new Observable<SchoolStream[]>();
	academicYears$: Observable<OlevelAcademicYear[]> = this.evaluationService.getAcademicYears().pipe(map(data => data.academicYears));
	exams$: Observable<TermExam[]> = new Observable<TermExam[]>();
	transcriptFormGroup!: FormGroup;

	constructor(
		private dataService: DataService,
		private formBuilder: FormBuilder,
		private evaluationService: EvaluationService) {
	}

	ngOnInit(): void {
		this.initializeTranscriptFormGroup();
	}

	private initializeTranscriptFormGroup() {
		this.transcriptFormGroup = this.formBuilder.group({
			academicYearId: [null, Validators.required],
			form: [null, Validators.required],
			streamId: [null, Validators.required],
			yearSummaryTerms: [],
			yearSummarySeriesId: []
		});

		this.onFormChange();
		this.onAcademicYearChangeOrStreamChange();
		this.onYearSummarySeriesChange();
	}

	private onFormChange() {
		this.transcriptFormGroup.get("form")?.valueChanges.subscribe(form => {
			this.transcriptFormGroup.patchValue({
				streamId: null
			});

			this.currentStreamList$ = this.dataService.schoolData.pipe(map(data => {
				const currentForm = data?.current_forms_list.find(currentForm => currentForm.intakeid === form);
				return currentForm?.streams || [];
			}));
		});
	}

	private onAcademicYearChangeOrStreamChange() {
		const academicYearChange$ = this.f["academicYearId"]?.valueChanges as Observable<number>;
		const streamChange$ = this.f["streamId"]?.valueChanges as Observable<number>;

		combineLatest([academicYearChange$, streamChange$]).subscribe(([academicYearId, streamId]) => {
			if (academicYearId && streamId) {
				this.exams$ = this.evaluationService.getExamsPerAcademicYearAndStream(academicYearId, streamId);
			}
		});
	}

	private onYearSummarySeriesChange() {
		this.f["yearSummarySeriesId"]?.valueChanges.subscribe(seriesId => {
			this.f["yearSummaryTerms"]?.patchValue(null);
		});
	}

	private get f(): { [key: string]: AbstractControl } {
		return this.transcriptFormGroup.controls;
	}

	submitForm() {
		if (this.transcriptFormGroup.invalid) {
			return;
		}

		let { yearSummaryTerms, yearSummarySeriesId } = this.transcriptFormGroup.value;
		const { academicYearId, streamId } = this.transcriptFormGroup.value;

		yearSummaryTerms = yearSummaryTerms ? JSON.stringify(yearSummaryTerms) : null;
		yearSummarySeriesId = yearSummarySeriesId ? JSON.stringify(yearSummarySeriesId) : null;

		this.onFormSubmit.emit({ academicYearId, yearSummaryTerms, streamId, yearSummarySeriesId });
	}
}
