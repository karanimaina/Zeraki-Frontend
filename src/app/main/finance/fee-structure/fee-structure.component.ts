import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { combineLatest, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-fee-structure",
	templateUrl: "./fee-structure.component.html",
	styleUrls: ["./fee-structure.component.scss"]
})
export class FeeStructureComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();
	academicYears$?: Observable<any>;
	yearId?: any;
	feeStructures?: any;
	selectedFeeStructure?: any;
	yearSelection = new FormControl();
	studentId?: number;
	roles?: any;

	constructor(
		private financeService: FinanceService,
		private rolesService: RolesService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		combineLatest([
			this.rolesService.roleSubject
		]).pipe(takeUntil(this.destroy$)).subscribe({
			next: ([roles]) => {
				this.roles = roles;
				if (this.roles) {
					this.roles?.isStudent? this.getStudent(): this.getAcademicYears();	
				}
				
			}
		});
	}

	getStudent() {
		combineLatest([
			this.financeService.studentInfo$,
		]).pipe(takeUntil(this.destroy$)).subscribe(([studentInfo]) => {
			this.studentId = studentInfo.id;
			this.studentId? this.getAcademicYears(): "";
		});
	}

	getFeeStructures(yearId: number): void {
		this.feeStructures = null;
		this.yearId = yearId;

		if (this.roles?.isStudent) {
			this.financeService.getFeeStructures(yearId, this.studentId).subscribe(
				(resp) => {
					this.feeStructures = resp;
				},
				(error) => {
					this.feeStructures = { hasError: true, error };
				}
			);
		} else {
			this.financeService.getFeeStructures(yearId).subscribe(
				(resp) => {
					this.feeStructures = resp;
				},
				(error) => {
					this.feeStructures = { hasError: true, error };
				}
			);
		}
	}

	getAcademicYears(): void {
		this.yearSelection.valueChanges.subscribe((yearId) =>
			this.getFeeStructures(yearId)
		);
	
		this.academicYears$ = this.financeService.academicYears$;
	
		this.financeService.getCurrentAcademicYear().subscribe(currentYear => {
			if (currentYear?.id) {
				this.yearSelection.setValue(currentYear?.id);
			} else {
				this.feeStructures = { list: [], noYears: true };
			}
		});
	}

}
