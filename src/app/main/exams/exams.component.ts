import { Component, OnInit } from "@angular/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-exams",
	templateUrl: "./exams.component.html",
	styleUrls: ["./exams.component.scss"]
})
export class ExamsComponent implements OnInit {
	schoolTypeDataObj: any;

	constructor(private dataService: DataService, public networkService: NetworkService) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe(resp => {
			this.schoolTypeDataObj = resp;
			// console.warn('Parent >> ', resp);
		});
	}

}
