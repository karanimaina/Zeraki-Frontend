import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-open-date",
	templateUrl: "./open-date.component.html",
	styleUrls: ["./open-date.component.scss"]
})
export class OpenDateComponent implements OnInit {

  @Input() openingDate: any;
  @Input() reportingTime?: string;
  constructor() { }

  ngOnInit(): void {
  }

}
