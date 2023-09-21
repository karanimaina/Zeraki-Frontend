import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from "@angular/core";
import {SchoolService} from "../../../../../../@core/shared/services/school/school.service";
import {Observable} from "rxjs";
import {SchoolInfo} from "../../../../../../@core/models/school-info";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
	selector: "app-olevel-transcripts-options",
	templateUrl: "./olevel-transcripts-options.component.html",
	styleUrls: ["./olevel-transcripts-options.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OlevelTranscriptsOptionsComponent implements OnInit {
	@Output() optionsFormChanges: EventEmitter<any> = new EventEmitter<any>();
	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	transcriptOptionsForm!: FormGroup;

	constructor(
		private schoolService: SchoolService,
		private formBuilder: FormBuilder) { }

	ngOnInit(): void {
		this.initializeTranscriptOptionsForm();
		// Emit onInit to set default in parent component
		this.optionsFormChanges.emit(this.transcriptOptionsForm.value);
	}

	private initializeTranscriptOptionsForm(): void {
		this.transcriptOptionsForm = this.formBuilder.group({
			attendanceReport: [true],
			gradeDescriptor: [true],
			classTeacherComments: [true],
			principalComments: [true],
			classTeacherSignature: [true],
			principalSignature: [true],
		});

		this.transcriptOptionsForm.valueChanges.subscribe((value) => {
			this.optionsFormChanges.emit(value);
		});
	}

}
