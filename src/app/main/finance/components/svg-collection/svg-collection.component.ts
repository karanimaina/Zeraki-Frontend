import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-svg-collection",
	templateUrl: "./svg-collection.component.html",
	styleUrls: ["./svg-collection.component.scss"]
})
export class SvgCollectionComponent implements OnInit {

	@Input() svgType!: string;
	constructor() { }

	ngOnInit(): void {
	}

}
