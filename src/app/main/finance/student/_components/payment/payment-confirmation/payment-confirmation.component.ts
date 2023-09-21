import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { Micropayment } from "src/app/@core/models/finance/micropayment";
import { StkData } from "src/app/@core/models/finance/stk";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-payment-confirmation",
	templateUrl: "./payment-confirmation.component.html",
	styleUrls: ["./payment-confirmation.component.scss"]
})
export class PaymentConfirmationComponent implements OnInit {

	@Output() stage: EventEmitter<Micropayment> = new EventEmitter<Micropayment>();
	@Output() success: EventEmitter<Micropayment> = new EventEmitter<Micropayment>();
	@Input() payment!: Micropayment;
	@Input() stkPayload?: StkData;
	destroy$: Subject<boolean> = new Subject<boolean>();
	saving = false;
	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	convenienceFee = 0;


	constructor(
		private financeService: FinanceService,
		private responseHandler: ResponseHandlerService,
		private schoolService: SchoolService
	) { }

	ngOnInit(): void { }

	confirmPayment() {
		this.saving = true;
		this.financeService.generateStk(this.stkPayload!).pipe(takeUntil(this.destroy$), finalize(() => this.saving = false)).subscribe({
			error: err => {
				this.responseHandler.error(err, "confirmPayment()");
			},
			complete: () => {
				this.payment.stage = 3;
				this.stage.emit(this.payment);
				this.success.emit(this.payment);
			}
		});
	}

	previousPage() {
		this.payment.stage = 1;
		this.stage.emit(this.payment);
	}

}
