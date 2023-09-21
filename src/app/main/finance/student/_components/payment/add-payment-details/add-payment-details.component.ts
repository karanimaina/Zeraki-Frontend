import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Micropayment } from "src/app/@core/models/finance/micropayment";
import { StkData } from "src/app/@core/models/finance/stk";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { UserInit } from "src/app/@core/models/user_init";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-add-payment-details",
	templateUrl: "./add-payment-details.component.html",
	styleUrls: ["./add-payment-details.component.scss"]
})
export class AddPaymentDetailsComponent implements OnInit, OnDestroy {

	@Output() stage: EventEmitter<Micropayment> = new EventEmitter<Micropayment>();
	@Output() closeModal: EventEmitter<boolean> = new EventEmitter();
	@Input() studentAdm?: number;
	@Output() stkPayload: EventEmitter<StkData> = new EventEmitter();
	@Input() payment!: Micropayment;

	stkData$: Observable<any> = this.financeService.getStkData();
	stkData: any;
	userInit$: Observable<UserInit> = this.dataService.userInitSubject;

	destroy$: Subject<boolean> = new Subject<boolean>();
	paymentForm!: SubmitFormGroup;
	myNumber = true;
	paymentSources = ["Mpesa", "Bank"];

	primaryPhone?: number;

	constructor(
		private financeService: FinanceService,
		private studentsService: StudentsService,
		private authService: AuthService,
		private responseHandler: ResponseHandlerService,
		private toast: HotToastService,
		private dataService: DataService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.bindForm();
		this.getStkData();
		if (this.authService?.loggedInUser?.roles?.isStudent) this.getPrimaryPhoneNumber();
	}

	getStkData() {
		this.stkData$.pipe(takeUntil(this.destroy$)).subscribe(stk => {
			this.stkData = stk;
			this.paymentTo?.setValue(this.stkData?.list[0]);
		});
	}

	bindForm() {
		this.payment?? new Micropayment();
		this.paymentForm = new SubmitFormGroup({
			paymentSource: new FormControl({ value: this.payment.paymentSource, disabled: true }, [Validators.required]),
			phoneNumber: new FormControl({ value: this.payment.phoneNumber, disabled: true }),
			otherNumber: new FormControl(this.payment.phoneNumber),
			paymentTo: new FormControl({ value: this.payment.paymentTo, disabled: true }, [Validators.required]),
			amount: new FormControl(this.payment.amount, [Validators.required])
		});
	}

	compareAccounts(item: any, selected: any) {
		return item.accountId == selected.accountId;
	}

	getPrimaryPhoneNumber() {
		this.studentsService.getStudentsProfile(this.authService.loggedInUser.userid).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				this.primaryPhone = resp?.primary_guardian_phone || resp?.secondary_guardian_phone;
				if (this.primaryPhone) {
					this.phoneNumber?.patchValue(this.primaryPhone);
				}
			},
			error: err => {
				this.responseHandler.error(err, "getPrimaryPhoneNumber()");
			},
			complete: () => {
				if (this.primaryPhone) {
					this.togglePaymentNumber("primary");
				} else if (!this.primaryPhone) {
					this.togglePaymentNumber("other");
				}
			}
		});
	}

	get paymentSource() {
		return this.paymentForm.get(["paymentSource"]);
	}

	get phoneNumber() {
		return this.paymentForm.get(["phoneNumber"]);
	}

	get otherNumber() {
		return this.paymentForm.get(["otherNumber"]);
	}

	get paymentTo() {
		return this.paymentForm.get(["paymentTo"]);
	}

	get amount() {
		return this.paymentForm.get(["amount"]);
	}

	makePayment() {
		if (!this.studentAdm) {
			this.toast.warning("Invalid student admission number");
			return;
		}
		if (!this.stkData.list[0].schoolCode) {
			this.toast.warning("Invalid school code");
			return;
		}

		const payload: StkData = {
			msisdn: this.myNumber ? this.phoneNumber?.value : this.otherNumber?.value,
			accountCode: `${this.stkData.list[0].schoolCode}${this.studentAdm}`,
			amount: this.amount?.value,
			apiKey: this.stkData.list[0].apiKey,
			apiUrl: this.stkData.list[0].apiUrl,
			product: "ZERAKI_FINANCE"
		};

		this.stkPayload.emit(payload);

		const payment: Micropayment = {
			stage: 2,
			paymentSource: this.paymentSource?.value,
			phoneNumber: this.myNumber ? this.phoneNumber?.value : this.otherNumber?.value,
			paymentTo: this.paymentTo?.value,
			amount: this.amount?.value,
			product: "ZERAKI_FINANCE"
		};
		this.stage.emit(payment);

	}

	togglePaymentNumber(source: string) {
		switch (source) {
		case "primary":
			this.myNumber = true;
			if (this.primaryPhone) {
				this.phoneNumber?.patchValue(this.primaryPhone);
			}
			break;
		case "other":
			this.myNumber = false;
			if (!this.primaryPhone) {
				this.phoneNumber?.patchValue("No primary phone found");
			}
			this.otherNumber?.setValidators([Validators.required]);
			break;

		default:
			this.myNumber = true;
			if (this.primaryPhone) {
				this.phoneNumber?.patchValue(this.primaryPhone);
			}
			break;
		}
	}

	cancel() {
		this.closeModal.emit();
	}

}
