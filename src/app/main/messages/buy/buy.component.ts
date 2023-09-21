import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";

@Component({
	selector: "app-buy",
	templateUrl: "./buy.component.html",
	styleUrls: ["./buy.component.scss"]
})
export class BuyComponent implements OnInit {
	sms_details: any;
	all_purchases: any;
	isLoadingSmsPurchases = false;

	showPurchases = false;
	// showReceipt = false;
	// purchases = PURCHASES;

	constructor(
    private messagingService: MessagingService,
    private router: Router,
	) { }

	ngOnInit(): void {
		this.getSMSDetails();
	}

	getSMSDetails() {
		this.messagingService.getSMSDetails().subscribe(resp => {
			// console.warn("getSMSDetails() DATA >> ", resp);
			this.sms_details = resp;
		});
	}

	getSMSPurchases() {
		this.isLoadingSmsPurchases = true;
		this.messagingService.getSMSPurchases().subscribe(resp => {
			// console.warn("getSMSPurchases() DATA >> ", resp);
			this.all_purchases = resp;
			this.messagingService.smsPurchasesSubject.next(this.all_purchases);
			this.isLoadingSmsPurchases = false;
		},err=>{
			this.isLoadingSmsPurchases = false;
		});
	}

	navigateToReceipt(i: number) {
		// this.dataService.setObjData(this.all_purchases);
		this.router.navigateByUrl(`/main/messages/receipt/${i}`);
	}

}
