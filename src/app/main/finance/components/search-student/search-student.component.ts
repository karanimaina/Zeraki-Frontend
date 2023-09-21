import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgModel } from "@angular/forms";
import { forkJoin, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-search-student",
	templateUrl: "./search-student.component.html",
	styleUrls: ["./search-student.component.scss"]
})
export class SearchStudentComponent implements OnInit {

	studentData: any = {};
	st: any;
	destroy$: Subject<boolean> = new Subject<boolean>();
	@Input("studentAdmno") studentAdmno = "";
	@Output() studentDataEvt: EventEmitter<any> = new EventEmitter();
	@Output() streamEvt: EventEmitter<any> = new EventEmitter();
	@Output() studentFoundEvt: EventEmitter<any> = new EventEmitter();
	isLoadingBalances!: boolean;
	studentFound!: boolean;
	isSubmitted = false;
	value: any = "";
	isSearching = false;

	constructor(
		private financeService: FinanceService,
		private errorHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}


	search(searchKey: NgModel) {
		this.isSubmitted = false;

		if (searchKey.invalid) return;

		const student = searchKey.value;
		if (student && student.length > 0) {
			this.searchStudent(student);
		}
	}

	searchStudent(student: any) {

		this.isSearching = true;
		this.financeService.getFeeBalanceByAdm(student)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: e => {
					this.isSearching = false;
					this.st = e;
					if (this.st && Object.keys(this.st).length > 0 && this?.st?.list && this?.st?.list?.length > 0) {
						this.getStudentData(this.st.list[0].id);
					} else {
						this.isSubmitted = true;
						this.studentFound = false;
						this.value = student;
					}
	
				},
				error: err => {
					this.isSearching = false;
					this.errorHandler.error(err, "searchStudent()");
				}
			});
	}

	getStudentData(student_id: number) {
		this.loadStudentInfoAsFork(student_id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ([balanceSummary, studentStatements, collections]) => {
					this.studentData.balanceSummary = (balanceSummary as any)?.list[0];
					this.studentData.studentStatements = (studentStatements as any)?.list;
					this.studentData.collections = (collections as any)?.list;
					this.studentData.parentIndex = -1;
					// console.warn("this.studentData.balanceSummary >> ", this.studentData);

					this.studentDataEvt.emit(this.studentData);
					this.studentFoundEvt.emit(true);
				},
				error: (err) => {
					console.error("Failed to set schoolInfo", err);
				},
				complete: () => {
					this.isLoadingBalances = false;
				}
			});
	}

	loadStudentInfoAsFork(student_id: any): Observable<any> {
		return forkJoin([
			this.financeService.getFeeBalanceByStudentId(student_id),
			this.financeService.getStudStatements(student_id),
			this.financeService.getStdCollections(student_id)
		]).pipe(takeUntil(this.destroy$));
	}

	clear() {
		this.st = "";
	}



}
