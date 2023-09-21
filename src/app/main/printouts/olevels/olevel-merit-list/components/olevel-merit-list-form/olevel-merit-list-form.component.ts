import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {OlevelAcademicYear} from "../../../../../../@core/models/olevel/olevel-academic-year";
import { map} from "rxjs/operators";
import {EvaluationService} from "../../../../../../@core/services/exams/evaluations/evaluation.service";
import {DataService} from "../../../../../../@core/shared/services/data/data.service";
import {SchoolIntake, SchoolStream} from "../../../../../../@core/models/school-type-data";

@Component({
	selector: "app-olevel-merit-list-form",
	templateUrl: "./olevel-merit-list-form.component.html",
	styleUrls: ["./olevel-merit-list-form.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OlevelMeritListFormComponent implements OnInit {
	@Output() onSubmitMeritListForm: EventEmitter<any> = new EventEmitter<any>();
	academicYears$: Observable<OlevelAcademicYear[]> = this.evaluationService.getAcademicYears()
		.pipe(map(res => res.academicYears));
	formOrYear$: Observable<string> = this.dataService.schoolData
		.pipe(map(res => res?.formoryear));
	currentFormList$: Observable<SchoolIntake[]> = this.dataService.schoolData
		.pipe(map(res => res?.current_forms_list));
	currentStreamList$!: Observable<SchoolStream[]>;

	meritListForm!: FormGroup;

	constructor(
		private fb: FormBuilder,
		private evaluationService: EvaluationService,
		private dataService: DataService) { }

	ngOnInit(): void {
		this.initializeMeritListForm();
	}

	private initializeMeritListForm() {
		this.meritListForm = this.fb.group({
			academicYear: ["", Validators.required],
			term: ["", Validators.required],
			intakeId: ["", Validators.required],
			streamId: [""]
		});

		this.onIntakeChange();
	}

	private onIntakeChange() {
		this.meritListForm.get("intakeId")?.valueChanges.subscribe(intakeId => {
			this.meritListForm.patchValue({
				streamId: ""
			});

			this.currentStreamList$ = this.currentFormList$
				.pipe(map(intakes => {
					const currentIntake = intakes.find(intake => intake.intakeid === intakeId);
					return currentIntake?.streams || [];
				}));
		});
	}

	submitForm() {
		if (this.meritListForm.invalid) {
			return;
		}

		this.onSubmitMeritListForm.emit(this.meritListForm.value);
	}

}
