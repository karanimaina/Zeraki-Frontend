import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { take } from "rxjs/operators";
import { FinanceService } from "src/app/@core/services/finance/finance.service";

@Component({
	selector: "app-intake-balance",
	templateUrl: "./intake-balance.component.html",
	styleUrls: ["./intake-balance.component.scss"]
})
export class IntakeBalanceComponent implements OnInit {
	isLoadingBalances = true;
	@Input() dashboardStatistics: any;
	@Input() streamData: any;
	@Output() toggleView: EventEmitter<Event> = new EventEmitter<Event>();

	constructor(private financeService: FinanceService) { }

	ngOnInit(): void {
		this.streamData? this.isLoadingBalances = false : this.isLoadingBalances = true;
	}

	getFeeBalanceByStream(stream: any) {
		this.isLoadingBalances = true;
		this.financeService.getFeeBalanceByStream(stream.streamId).pipe(take(1)).subscribe({
			next: (resp: any) => {
				this.toggleView.emit(({stream: stream, resp: resp}) as any);
			},
			error: err => { },
			complete: () => {
				this.isLoadingBalances = false;
			}
		});
	}

}
