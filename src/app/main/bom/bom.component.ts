import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-bom",
	templateUrl: "./bom.component.html",
	styleUrls: ["./bom.component.scss"]
})
export class BomComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}
  
}
