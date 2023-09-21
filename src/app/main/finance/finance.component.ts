import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-finance",
	templateUrl: "./finance.component.html",
	styleUrls: ["./finance.component.scss"]
})
export class FinanceComponent implements OnInit, OnDestroy {

	destroy$: Subject<boolean> = new Subject();
	loggedInUser = this.authService.loggedInUser;
	stkData$: Observable<any> = this.financeService.getStkData();

	constructor(
		public networkService: NetworkService, 
		private financeService: FinanceService,
		private authService: AuthService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		if (this.loggedInUser.admno) this.financeService.setStudent(this.loggedInUser.admno);
	}

}
