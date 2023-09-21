import { Component, OnInit } from "@angular/core";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-students",
	templateUrl: "./students.component.html",
	styleUrls: ["./students.component.scss"]
})
export class StudentsComponent implements OnInit {

	constructor(
    public networkService: NetworkService,
	) { }

	ngOnInit(): void {}

}
