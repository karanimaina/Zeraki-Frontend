import {Component, Input, OnInit} from "@angular/core";
import {SchoolService} from "../../../../../@core/shared/services/school/school.service";
import {SchoolInfo} from "../../../../../@core/models/school-info";
import {Observable} from "rxjs";

@Component({
	selector: "app-school-details",
	templateUrl: "./school-details.component.html",
	styleUrls: ["./school-details.component.scss"]
})
export class SchoolDetailsComponent implements OnInit {
	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	@Input() title!: string;
	@Input() subtitle!: string;
	constructor(private schoolService: SchoolService) { }

	ngOnInit(): void {
	}

}
