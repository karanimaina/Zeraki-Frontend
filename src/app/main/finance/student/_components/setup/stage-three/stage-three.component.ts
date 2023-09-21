import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { SetupStage } from "src/app/@core/models/finance/setup-stage";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";

@Component({
	selector: "app-stage-three",
	templateUrl: "./stage-three.component.html",
	styleUrls: ["./stage-three.component.scss"]
})
export class StageThreeComponent implements OnInit {
  @Input() setupStage: SetupStage = new SetupStage();
  @Output() OStage: EventEmitter<SetupStage> = new EventEmitter<SetupStage>();
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();

  saving = false;
  amountForm!: SubmitFormGroup;

  constructor() { }

  ngOnInit(): void {
  	this.bindForm();
  }

  bindForm() {
  	this.amountForm = new SubmitFormGroup({
  		expectedPay: new FormControl({ value: this.setupStage.expectedPayVal, disabled: true }, [Validators.required]),
  		duration: new FormControl({ value: this.setupStage.duration, disabled: true }, [Validators.required]),
  		frequency: new FormControl({ value: this.setupStage.frequency, disabled: true }, [Validators.required]),
  		amount: new FormControl(this.setupStage.amount || "", [Validators.required, Validators.max(this.setupStage.expectedPayVal || 0)])
  	});
  }

  get expectedPay() {
  	return this.amountForm.get(["expectedPay"]); 
  }
  get duration() {
  	return this.amountForm.get(["duration"]); 
  }
  get frequency() {
  	return this.amountForm.get(["frequency"]); 
  }
  get amount() {
  	return this.amountForm.get(["amount"]); 
  }

  addAmount() {
  	this.saving = false;
  	console.warn("this.expectedPay >> ", this.expectedPay?.value);
  	console.warn("this.duration >> ", this.duration?.value);
  	console.warn("this.frequency >> ", this.frequency?.value);
  	console.warn("this.amountForm >> ", this.amountForm.value);
    this.closeModal.emit();
  }

  cancel() {
  	this.OStage.emit({ stage: 2, expectedPayVal: this.setupStage.expectedPayVal, duration: this.setupStage.duration, frequency: this.setupStage.frequency });
  }
}
