import { Component, Input, OnInit } from "@angular/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-invoice-top-nav",
	templateUrl: "./invoice-top-nav.component.html",
	styleUrls: ["./invoice-top-nav.component.scss"]
})
export class InvoiceTopNavComponent implements OnInit {

	@Input() docType: any = "";

	userInit: any;

	constructor(private dataService: DataService) { }

	ngOnInit(): void {
		this.dataService.userInitSubject.subscribe(r => {
			this.userInit = r;
		});
	}

}
