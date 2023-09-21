import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { forkJoin, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FinanceStudent } from "src/app/@core/models/finance/student";
import { FinanceService } from "src/app/@core/services/finance/finance.service";

@Component({
	selector: "app-stream-balance",
	templateUrl: "./stream-balance.component.html",
	styleUrls: ["./stream-balance.component.scss"]
})
export class StreamBalanceComponent implements OnInit, OnDestroy {
	isLoadingBalances = true;
	destroy$: Subject<boolean> = new Subject<boolean>();
	studentData: any = {};
	@Input() studentList: any;
	@Input() stream: any;
	@Input() parentIndex:any;
	@Input() streamIndex:any;

	financeStudents$?: Observable<FinanceStudent[]> = this.financeService.students$;
	@Output() toggleStudentView: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() toggleBalView: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() studentFoundEvt: EventEmitter<any> = new EventEmitter();
	@Output() streamEvt: EventEmitter<any> = new EventEmitter();

	constructor(private financeService: FinanceService) { }

	ngOnInit(): void {
		this.studentList ? this.isLoadingBalances = false : this.isLoadingBalances = true;
	}

	customSearchFn(term: string, item: FinanceStudent) {
		console.warn("term, item >>", term, item);
		term = term.toLowerCase();
		return item.studentNames.toLowerCase().indexOf(term) > -1 || item.admNo.includes(term);
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	getStudentData(student_id: number) {
		forkJoin([
			this.financeService.getFeeBalanceByStudentId(student_id),
			this.financeService.getStudStatements(student_id),
			this.financeService.getStdCollections(student_id)
		]).pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ([balanceSummary, studentStatements, collections]) => {
					this.studentData.balanceSummary = (balanceSummary as any)?.list[0];
					this.studentData.studentStatements = (studentStatements as any)?.list;
					this.studentData.collections = (collections as any)?.list;
					this.studentData.parentIndex = this.parentIndex;
					this.studentData.streamIndex = this.streamIndex;
					// console.warn("this.studentData.balanceSummary >> ", this.studentData);
					this.toggleStudentView.emit(this.studentData);
					this.studentFoundEvt.emit(true);
					this.streamEvt.emit(this.stream);
				},
				error: (err) => {
					console.error("Failed to set schoolInfo", err);
				},
				complete: () => {
					this.isLoadingBalances = false;
				}
			});
	}

	toggleBalanceView() {
		this.toggleBalView.emit({
			parentIndex:this.parentIndex
		} as any);
	}


}
