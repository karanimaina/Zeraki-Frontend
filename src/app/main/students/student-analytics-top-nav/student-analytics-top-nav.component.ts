import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-student-analytics-top-nav",
	templateUrl: "./student-analytics-top-nav.component.html",
	styleUrls: ["./student-analytics-top-nav.component.scss"]
})
export class StudentAnalyticsTopNavComponent implements OnInit {

  @Input() routeId:any;

  constructor() { }


  ngOnInit(): void {
  }

}
