import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-printouts",
	templateUrl: "./printouts.component.html",
	styleUrls: ["./printouts.component.scss"]
})
export class PrintoutsComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
