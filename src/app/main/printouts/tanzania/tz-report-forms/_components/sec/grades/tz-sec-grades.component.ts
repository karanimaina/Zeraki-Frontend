import { Component, OnInit } from "@angular/core";

@Component({
	selector: "app-tz-sec-grades",
	templateUrl: "./tz-sec-grades.component.html",
	styleUrls: ["./tz-sec-grades.component.scss"]
})
export class TzSecGradesComponent implements OnInit {

	constructor() { }

	ngOnInit(): void { }

	secondarySchAcademicGrades: any[] = [
		{
			grade: "A",
			olevelRange: "75 - 100",
			olevelRangeMeaning: "Excellent",
			alevelRange: "80 - 100",
			alevelRangeMeaning: "Excellent",
		},
		{
			grade: "B",
			olevelRange: "65 - 74",
			olevelRangeMeaning: "Very Good",
			alevelRange: "70 - 79",
			alevelRangeMeaning: "Very Good",
		},
		{
			grade: "C",
			olevelRange: "45 - 64",
			olevelRangeMeaning: "Good",
			alevelRange: "60 - 69",
			alevelRangeMeaning: "Good",
		},
		{
			grade: "D",
			olevelRange: "30 - 44",
			olevelRangeMeaning: "Satisfactory",
			alevelRange: "50 - 59",
			alevelRangeMeaning: "Average",
		},
		{
			grade: "E",
			olevelRange: "",
			olevelRangeMeaning: "",
			alevelRange: "40 - 49",
			alevelRangeMeaning: "Satisfactory",
		},
		{
			grade: "S",
			olevelRange: "",
			olevelRangeMeaning: "",
			alevelRange: "35 - 39",
			alevelRangeMeaning: "Subsidiary",
		},
		{
			grade: "F",
			olevelRange: "00 - 29",
			olevelRangeMeaning: "Fail",
			alevelRange: "00 - 34",
			alevelRangeMeaning: "Fail",
		},
	];
}
