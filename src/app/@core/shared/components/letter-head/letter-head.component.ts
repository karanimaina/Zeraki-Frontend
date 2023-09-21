import { Component, OnInit } from "@angular/core";
import { DataService } from "../../services/data/data.service";

@Component({
	selector: "app-letter-head",
	templateUrl: "./letter-head.component.html",
	styleUrls: ["./letter-head.component.scss"]
})
export class LetterHeadComponent implements OnInit {

	school_profile: any;
	constructor(private schoolService: DataService) { }

	ngOnInit(): void {
		this.getSchoolProfile();
	}

	getSchoolProfile() {
		this.schoolService.schoolData.subscribe(resp => {
			this.school_profile = resp;
		});
	}

}
