import { CurrencyPipe, Location } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { combineLatest, Observable, of, Subject, timer } from "rxjs";
import { catchError, takeUntil } from "rxjs/operators";
import { Micropayment } from "src/app/@core/models/finance/micropayment";
import { SetupStage } from "src/app/@core/models/finance/setup-stage";
import { FinanceStudent } from "src/app/@core/models/finance/student";
import { Role } from "src/app/@core/models/Role";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-student-balance",
	templateUrl: "./student-balance.component.html",
	styleUrls: ["./student-balance.component.scss"],
	encapsulation: ViewEncapsulation.None, // Used for payment complete formatting
})
export class StudentBalanceComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();

	@Input() fromStudents = false;
	@Input() studentData: any;
	@Input() stream: any;
	@Output() toggleBalView: EventEmitter<any> = new EventEmitter<any>();
	
	financeStudents$?: Observable<FinanceStudent[]> = this.financeService.students$;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	stkData$: Observable<any> = this.financeService.getStkData();

	isLoadingBalances = true;
	date = new Date();
	payment: Micropayment = new Micropayment();
	setupStage: SetupStage = new SetupStage();
	hasMicropaymentPlan = false;
	termStatements: Array<{termName: string, startDate: number, endDate: number, statements: Array<any>}> = [];

	@ViewChild("closePaymentModal") closePaymentModal?: ElementRef;
	@ViewChild("closeSetupModal") closeSetupModal?: ElementRef;

	paymentInstallments = 5;
	micropayments = [
		{
			"id": 11316376,
			"createdAt": 1668688489000,
			"createdByUserId": 2835397,
			"schoolId": 27663,
			"nextPayment": false,
			"paymentStatus": "Paid",
			"createdByUserName": "ZACCH M'COPONDO",
			"amount": 4000,
			"paymentDate": 1668688489000,
			"scheduledPaymentDate": 1668643200000
		},
		{
			"id": 11316376,
			"createdAt": 1668688489000,
			"createdByUserId": 2835397,
			"schoolId": 27663,
			"nextPayment": true,
			"paymentStatus": "Overdue",
			"scheduledPaymentDate": 1668688489000,
		},
		{
			"id": 11316376,
			"createdAt": 1668688489000,
			"createdByUserId": 2835397,
			"schoolId": 27663,
			"nextPayment": false,
			"paymentStatus": "",
			"scheduledPaymentDate": 1668688489000,
		}
	];

	constructor(
		private rolesService: RolesService,
		private financeService: FinanceService,
		private location: Location,
		private currencyPipe: CurrencyPipe,
		private responseHandler: ResponseHandlerService
	) {
		// when location change...
		// close modals...
		this.location.subscribe(location => {
			// ...close popup
			this.closePaymentModal?.nativeElement.click();
			this.closeSetupModal?.nativeElement.click();
		});
	}

	ngOnInit(): void {
		// console.log(this.studentData);
		this.studentData ? this.isLoadingBalances = false : this.isLoadingBalances = true;
		if (this.fromStudents) {
			this.getStudentData(this.studentData.id);
		}
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	customSearchFn(term: string, item: FinanceStudent) {
		console.warn("term, item >>", term, item);
		term = term.toLowerCase();
		return item.studentNames.toLowerCase().indexOf(term) > -1 || item.admNo.includes(term);
	}

	getStudentData(studentId: number) {
		combineLatest([
			this.financeService.getFeeBalanceByStudentId(studentId).pipe(catchError(e => of(e))),
			this.financeService.getStudStatements(studentId).pipe(catchError(e => of(e))),
			this.financeService.getStdCollections(studentId).pipe(catchError(e => of(e))),
		]).pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ([balanceSummary, studentStatements, collections]) => {
					this.studentData.balanceSummary = (balanceSummary as any)?.list[0];
					this.studentData.studentStatements = (studentStatements as any)?.list;
					this.studentData.collections = (collections as any)?.list;
					// console.warn("this.studentData >> ", this.studentData);
					this.getTerms();
				},
				error: (err) => {
					this.responseHandler.error(err, "getStudentData()");
				},
				complete: () => {
					this.isLoadingBalances = false;
				}
			});
	}

	getTerms() {
		this.financeService.getTerms().subscribe({
			next: resp => {
				this.mapTerms(resp?.list);
			},
			error: err => { },
		});
	}
  
	mapTerms(terms: Array<any>) {
		this.termStatements = terms.map(term => {
			return {
				termName: term.name,
				startDate: term.termBeginDate,
				endDate: term.termEndDate,
				statements: this.studentData?.studentStatements?.filter(({termId}) => termId == term?.id)
			};
		});
		this.termStatements = this.termStatements.filter(({statements}) => statements.length > 0);
	}

	toggleBalanceView() {
		this.toggleBalView.emit({ parentIndex: this.studentData.parentIndex });
	}

	closeModal(success?: any) {
		this.closePaymentModal?.nativeElement.click();
		this.closeSetupModal?.nativeElement.click();
	}

	successDialog(payment: any) {
		this.closePaymentModal?.nativeElement.click();
		this.closeSetupModal?.nativeElement.click();
		Swal.fire({
			text: `Your payment of ${this.currencyPipe.transform(payment.amount)} has been triggered for processing.Once complete your statement will be updated.`,
			iconHtml: "<img height=\"75rem\" width=\"75rem\" src=\"../../../../../../../assets/img/payment-complete.png\" alt=\"Payment complete\">",
			customClass: {
				icon: "no-border"
			}
		});
		timer(120000).subscribe(resp => {
			this.getStudentData(this.studentData.id);
		});
	}

	initPayment() { 
		this.payment = new Micropayment();
	}

	initSetup() { 
		this.setupStage = new SetupStage();
	}

}
