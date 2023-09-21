import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-loader-div",
	templateUrl: "./loader-div.component.html",
	styleUrls: ["./loader-div.component.scss"]
})
export class LoaderDivComponent implements OnInit {

  @Input() height:any = "";

  constructor() { }

  ngOnInit(): void {
  }

}
