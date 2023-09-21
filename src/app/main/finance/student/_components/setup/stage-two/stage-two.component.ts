import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { SetupStage } from "src/app/@core/models/finance/setup-stage";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";

@Component({
	selector: "app-stage-two",
	templateUrl: "./stage-two.component.html",
	styleUrls: ["./stage-two.component.scss"]
})
export class StageTwoComponent implements OnInit {
  @Input() setupStage: SetupStage = new SetupStage();
  @Output() OStage: EventEmitter<SetupStage> = new EventEmitter<SetupStage>();
  saving = false;
  frequencyForm!: SubmitFormGroup;
  frequencyRanges: Array<{ name: string, value: string }> = [
  	{ name: "Daily", value: "daily" },
  	{ name: "Weekly", value: "weekly" },
  	{ name: "Monthly", value: "monthly" }
  ];

  constructor() { }

  ngOnInit(): void {
  	this.bindForm();
  }

  bindForm() {
    if (!this.setupStage.frequency) this.setupStage.frequency = this.frequencyRanges[0].value;
    
  	this.frequencyForm = new SubmitFormGroup({
  		expectedPay: new FormControl({ value: this.setupStage.expectedPayVal, disabled: true }, [Validators.required]),
  		frequency: new FormControl(this.setupStage.frequency, [Validators.required])
  	});
  }

  get expectedPay() {
  	return this.frequencyForm.get(["expectedPay"]);
  }

  get frequency() {
  	return this.frequencyForm.get(["frequency"]);
  }

  addFrequency() {
  	this.saving = false;
    
  	const setupStage: SetupStage = { ...this.setupStage };
  	setupStage.stage = 3;
  	setupStage.frequency = this.frequency?.value;
  	this.OStage.emit(setupStage);
  }

  cancel() {
  	this.OStage.emit({ stage: 1, expectedPayVal: this.setupStage.expectedPayVal, duration: this.setupStage.duration, frequency: this.frequency?.value });
  }

}
