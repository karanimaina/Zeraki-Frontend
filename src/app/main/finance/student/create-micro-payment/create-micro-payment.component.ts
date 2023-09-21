import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SetupStage } from "src/app/@core/models/finance/setup-stage";

@Component({
	selector: "app-create-micro-payment",
	templateUrl: "./create-micro-payment.component.html",
	styleUrls: ["./create-micro-payment.component.scss"]
})
export class CreateMicroPaymentComponent {
	@Input() setupStage: SetupStage = new SetupStage();
	@Output() close: EventEmitter<boolean> = new EventEmitter();

	constructor() { }

	closeModal() { 
		this.close.emit();
	}

	OStage(data: SetupStage) {
		this.setupStage = data;
	}
}