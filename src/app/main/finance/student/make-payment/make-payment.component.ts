import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Subject } from "rxjs";
import { Micropayment } from "src/app/@core/models/finance/micropayment";
import { StkData } from "src/app/@core/models/finance/stk";

@Component({
	selector: "app-make-payment",
	templateUrl: "./make-payment.component.html",
	styleUrls: ["./make-payment.component.scss"]
})
export class MakePaymentComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();

	@Input() payment: Micropayment = new Micropayment();
	@Input() studentAdm?: number;
	@Output() close: EventEmitter<boolean> = new EventEmitter();
	@Output() success: EventEmitter<Micropayment> = new EventEmitter();
	stkPayload?: StkData;


	constructor() { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit() { }

	OStage(data: Micropayment) {
		this.payment = data;
	}

	passStkPayload(payload: any) {
		this.stkPayload = payload;
	}

	onSuccess(data: Micropayment) {
		this.payment = data;
		this.success.emit(this.payment);
	}

	closeModal() {
		this.close.emit();
	}

}
