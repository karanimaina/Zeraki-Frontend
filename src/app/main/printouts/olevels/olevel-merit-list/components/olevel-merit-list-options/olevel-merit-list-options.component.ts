import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-olevel-merit-list-options",
	templateUrl: "./olevel-merit-list-options.component.html",
	styleUrls: ["./olevel-merit-list-options.component.scss"]
})
export class OlevelMeritListOptionsComponent implements OnInit, OnDestroy {
	@Output() optionsFormChanges: EventEmitter<any> = new EventEmitter<any>();
	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	meritListOptionsForm!: FormGroup;

	constructor(
		private schoolService: SchoolService,
		private formBuilder: FormBuilder,
	) { }

	ngOnInit(): void {
		this.initializeMeritListOptionsForm();
		// Emit onInit to set default in parent component
		this.optionsFormChanges.emit(this.meritListOptionsForm.value);
	}

	private initializeMeritListOptionsForm(): void {
		this.meritListOptionsForm = this.formBuilder.group({
			showProjects: [true],
			showExams: [true],
		});

		this.meritListOptionsForm.valueChanges.subscribe((value) => {
			this.optionsFormChanges.emit(value);
		});
	}

	ngOnDestroy(): void {
	}

}
