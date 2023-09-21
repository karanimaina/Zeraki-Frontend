import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolService } from "../../services/school/school.service";

@Component({
	selector: "app-receipt-header",
	templateUrl: "./receipt-header.component.html",
	styleUrls: ["./receipt-header.component.scss"]
})
export class ReceiptHeaderComponent implements OnInit {

	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	constructor(private schoolService: SchoolService) { }

	ngOnInit(): void { }

}
