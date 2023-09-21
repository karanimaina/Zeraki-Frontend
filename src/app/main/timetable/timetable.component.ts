import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-timetable",
	templateUrl: "./timetable.component.html",
	styleUrls: ["./timetable.component.scss"]
})
export class TimetableComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
