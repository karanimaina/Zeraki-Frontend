import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-exams",
	template: `
        <router-outlet *ngIf="!networkService.isNetworkStopped"></router-outlet>
		<app-connection-lost *ngIf="networkService.isNetworkStopped"></app-connection-lost>`,
})
export class EvaluationComponent implements OnInit {

	constructor(public networkService: NetworkService) {
	}

	ngOnInit(): void {
	}

}
