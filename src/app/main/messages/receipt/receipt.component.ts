import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { ReceiptPdfDoc } from "../../../@core/models/messages/receipt/receipt-pdf-doc";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-receipt",
	templateUrl: "./receipt.component.html",
	styleUrls: ["./receipt.component.scss"]
})
export class ReceiptComponent implements OnInit, OnDestroy {
	all_purchases: any;
	receiptIndex!: number;
	receiptSubscription?: Subscription;
	isLoading = true;
	pdfSrc!: Uint8Array;

	constructor(
		private messagingService: MessagingService,
		private activatedRoute: ActivatedRoute,
		private translate: TranslateService,
		private router: Router
	) {}

	ngOnDestroy(): void {
		this.receiptSubscription?.unsubscribe();
	}

	ngOnInit(): void {
		this.receiptIndex = this.activatedRoute.snapshot.params.id;
		console.warn("this.receiptIndex", this.receiptIndex);
		this.receiptSubscription = this.messagingService.smsPurchasesSubject.subscribe(resp => {
			if (!resp)
				this.getSMSPurchases();
			else {
				this.all_purchases = resp;
				this.displayReceipt();
			}
		});
	}

	getSMSPurchases() {
		this.receiptSubscription = this.messagingService.getSMSPurchases().subscribe(resp => {
			this.all_purchases = resp;
			this.messagingService.smsPurchasesSubject.next(this.all_purchases);
		});
	}

	async getReceiptPdf(): Promise<any> {
		const recipient = {
			school: this.all_purchases.schoolname,
			phone: this.all_purchases.phone,
			date: this.all_purchases?.purchases[this.receiptIndex]?.date,
			address1: this.all_purchases.addr1 || "",
			address2: this.all_purchases.addr2 || "",
		};
		const paymentInfo = this.all_purchases.purchases[this.receiptIndex];

		return new ReceiptPdfDoc(
			this.all_purchases?.purchases[this.receiptIndex]?.id,
			recipient,
			paymentInfo,
			this.translate
		).build();
	}


	async downloadReceipt() {
		try {
			const doc = await this.getReceiptPdf();
			const docName = this.all_purchases.schoolname + "_" + this.translate.instant("messages.receipt.receiptNo") + "_" + this.all_purchases.purchases[this.receiptIndex]?.id;
			doc.create().download(`${docName}.pdf`);
		} catch (e) {
			console.error(e);
		}
	}
	async displayReceipt() {
		this.getReceiptPdf().then(doc => {
			doc.create().getBlob((blob) => {
				const fileReader = new FileReader();
				fileReader.onload = () => {
					this.pdfSrc = new Uint8Array(fileReader.result as ArrayBuffer);
				};
				fileReader.readAsArrayBuffer(blob);
				this.isLoading = false;
			});
		});
	}

	navigateBack() {
		this.router.navigate(["/main/messages/buy"]);
	}

}
