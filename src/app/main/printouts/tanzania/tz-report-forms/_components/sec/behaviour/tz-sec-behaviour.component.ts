import { Component, OnInit } from "@angular/core";

@Component({
	selector: "app-tz-sec-behaviour",
	templateUrl: "./tz-sec-behaviour.component.html",
	styleUrls: ["./tz-sec-behaviour.component.scss"]
})
export class TzSecBehaviourComponent implements OnInit {

	constructor() { }

	ngOnInit(): void {
	}

	behavioursSecondarySch: any[] = [
		{
			character: "Diligence",
			grade: "",
			remarks: "",
		},
		{
			character: "Value of Work",
			grade: "",
			remarks: "",
		},
		{
			character: "Career for Properties",
			grade: "",
			remarks: "",
		},
		{
			character: "Obedience",
			grade: "",
			remarks: "",
		},
		{
			character: "Honesty",
			grade: "",
			remarks: "",
		},
		{
			character: "Cleanliness",
			grade: "",
			remarks: "",
		},
		{
			character: "Leadership Material",
			grade: "",
			remarks: "",
		},
		{
			character: "Willingness to Help Others",
			grade: "",
			remarks: "",
		},
		{
			character: "Patriotism",
			grade: "",
			remarks: "",
		},
		{
			character: "Attitude Towards School",
			grade: "",
			remarks: "",
		},
	];

}
