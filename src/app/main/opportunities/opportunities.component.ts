import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-opportunities",
	templateUrl: "./opportunities.component.html",
	styleUrls: ["./opportunities.component.scss"]
})
export class OpportunitiesComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
