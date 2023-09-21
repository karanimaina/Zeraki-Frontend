import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-staff",
	templateUrl: "./staff.component.html",
	styleUrls: ["./staff.component.scss"]
})
export class StaffComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
