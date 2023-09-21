import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-fee-balance",
	templateUrl: "./fee-balance.component.html",
	styleUrls: ["../student-report/student-report.component.scss"]
})
export class FeeBalanceComponent implements OnInit {
	@Input() feeData = {};

	constructor() { }

	ngOnInit(): void {
	}

}
