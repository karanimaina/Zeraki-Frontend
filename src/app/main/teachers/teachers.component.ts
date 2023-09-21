import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-teachers",
	templateUrl: "./teachers.component.html",
	styleUrls: ["./teachers.component.scss"]
})
export class TeachersComponent implements OnInit {

	constructor(public networkService: NetworkService) { }

	ngOnInit(): void {}
}
