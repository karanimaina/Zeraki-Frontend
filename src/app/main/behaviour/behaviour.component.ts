import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-behaviour",
	templateUrl: "./behaviour.component.html",
	styleUrls: ["./behaviour.component.scss"]
})
export class BehaviourComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
