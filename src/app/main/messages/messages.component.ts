import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-messages",
	templateUrl: "./messages.component.html",
	styleUrls: ["./messages.component.scss"]
})
export class MessagesComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {
	}

}
