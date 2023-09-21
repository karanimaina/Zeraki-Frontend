import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { SetupStage } from "src/app/@core/models/finance/setup-stage";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";

@Component({
	selector: "app-stage-one",
	templateUrl: "./stage-one.component.html",
	styleUrls: ["./stage-one.component.scss"]
})
export class StageOneComponent implements OnInit {
  @Output() OStage: EventEmitter<SetupStage> = new EventEmitter<SetupStage>();
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();

  setupStage: SetupStage = new SetupStage();
  saving = false;
  durationForm!: SubmitFormGroup;
  durationRanges: Array<{ name: string, value: number }> = [
  	{ name: "2 Months", value: 2 },
  	{ name: "3 Months", value: 3 }
  ];

  constructor() { }

  ngOnInit(): void {
  	this.bindForm();
  }

  bindForm() {
    if (!this.setupStage.duration) this.setupStage.duration = this.durationRanges[0].value;

  	this.durationForm = new SubmitFormGroup({
  		expectedPay: new FormControl(this.setupStage.expectedPayVal, [Validators.required]),
  		duration: new FormControl(this.setupStage.duration, [Validators.required])
  	});
  }

  get expectedPay() {
  	return this.durationForm.get(["expectedPay"]);
  }

  get duration() {
  	return this.durationForm.get(["duration"]);
  }

  addDuration() {
  	this.saving = false;

  	this.OStage.emit({ stage: 2, expectedPayVal: this.expectedPay?.value, duration: this.duration?.value, frequency: "" });
  }

	cancel() {
		this.closeModal.emit();
	}

}
