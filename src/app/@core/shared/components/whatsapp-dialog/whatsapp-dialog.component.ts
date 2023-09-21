import { Component, OnInit } from "@angular/core";
import { DataService } from "../../services/data/data.service";

@Component({
	selector: "app-whatsapp-dialog",
	templateUrl: "./whatsapp-dialog.component.html",
	styleUrls: ["./whatsapp-dialog.component.scss"]
})
export class WhatsappDialogComponent implements OnInit {

	userInit: any;
	constructor(private dataService: DataService) { }

	ngOnInit(): void {
		this.dataService.userInitSubject.subscribe(resp => {
			//console.warn('USER INIT >> ', resp.customer_care_number);
			this.userInit = resp;
		});
	}

}
