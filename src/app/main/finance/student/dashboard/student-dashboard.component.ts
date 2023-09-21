import { Component, OnDestroy, OnInit } from "@angular/core";
import { combineLatest, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Role } from "src/app/@core/models/Role";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-student-dashboard",
	templateUrl: "./student-dashboard.component.html",
	styleUrls: ["./student-dashboard.component.scss"]
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	isLoading = false;

	currentAcademicYear: any;
	terms$: any;

	studentData: any = {};
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	constructor(
		private rolesService: RolesService,
		private financeService: FinanceService,
	) { }

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getStudentData();
	}

	isLoadingBalances = false;
	getStudentData() {
		this.isLoading = true;
		combineLatest([this.financeService.studentInfo$]).pipe(takeUntil(this.destroy$)).subscribe(([student]) => {
			this.studentData = student;
			this.isLoading = false;
		});
	}


	getTerms(): void {
		this.financeService.terms$.pipe(takeUntil(this.destroy$)).subscribe(
			terms => this.terms$ = terms.list.filter(t => t.academicYearId == this.currentAcademicYear.id)
		);
	}

	getRatio(stats: any) {
		return stats.invoiced ?
			(stats.collected / stats.invoiced) * 100 :
			(stats.collectedAmount / stats.invoicedAmount) * 100;
	}

}
