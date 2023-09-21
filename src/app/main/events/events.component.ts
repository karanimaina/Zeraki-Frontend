import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-events",
	templateUrl: "./events.component.html",
	styleUrls: ["./events.component.scss"]
})
export class EventsComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
