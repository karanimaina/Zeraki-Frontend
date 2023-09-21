import {Component, Input, OnInit} from "@angular/core";
import {SchoolInfo} from "../../../../../@core/models/school-info";

@Component({
	selector: "app-school-address",
	templateUrl: "./school-address.component.html",
	styleUrls: ["./school-address.component.scss"]
})
export class SchoolAddressComponent implements OnInit {
	@Input() primaryColour!: string;
	@Input() profileUrl!: string;
	@Input() schoolInfo!: SchoolInfo;
	@Input() studentId!: number;
	@Input() assessmentTitle!: string;

	constructor() { }

	ngOnInit(): void {
	}

	changeImageSrcOnError($event) {
		$event.target.src = "assets/img/avatar/p_avatar_blue.png";
	}

}
