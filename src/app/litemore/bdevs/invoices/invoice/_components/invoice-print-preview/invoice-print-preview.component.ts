import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PdfMakeWrapper } from "pdfmake-wrapper";
import { ActivatedRoute } from "@angular/router";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { Invoice } from "src/app/@core/models/litemore/invoice/invoice";
import { ProformaInvoice } from "src/app/@core/models/litemore/invoice/proforma-invoice";
import { InvoicePdfDoc } from "src/app/@core/models/litemore/invoice/invoice-pdf-doc";
import { CompanyInfo } from "src/app/@core/models/litemore/invoice/company/company-info";
import { PaymentInfo } from "src/app/@core/models/litemore/invoice/account/account-info";

@Component({
	selector: "app-invoice-print-preview",
	templateUrl: "./invoice-print-preview.component.html",
	styleUrls: ["./invoice-print-preview.component.scss"]
})
export class InvoicePrintPreviewComponent implements OnInit {
	@Input() userInit: any;
	@Input() schoolInfo!: LitemoreSchoolProfile;
	@Input() selectedInvoice!: Invoice;
	@Input() invoices!: ProformaInvoice;
	@Input() companyInfo?: CompanyInfo;
	@Input() paymentInfo?: PaymentInfo;
	@Input() schoolDisplayInvoice = false;


	@Output() closePreview: EventEmitter<void> = new EventEmitter();

	listCollections = false;
	selectedCollection: any;
	invoicePdfDocument!: PdfMakeWrapper;
	pdfSrc!: Uint8Array;
	private routeParams: any;

	constructor(private activatedRoute: ActivatedRoute) { }

	ngOnInit(): void {
		this.routeParams = this.activatedRoute.snapshot.params;

		this.generateInvoicePdf();
	}

	private generateInvoicePdf() {
		const pdfDoc = new InvoicePdfDoc(this.selectedInvoice, this.schoolInfo, this.selectedInvoice?.kraPin || this.invoices?.kraPin, this.selectedInvoice?.vatRate || this.invoices?.vatRate, this.companyInfo, this.paymentInfo);

		pdfDoc.build().then((pdfDoc: PdfMakeWrapper) => {
			this.invoicePdfDocument = pdfDoc;
			this.invoicePdfDocument.create().getBlob((blob) => {
				const fileReader = new FileReader();
				fileReader.onload = () => {
					this.pdfSrc = new Uint8Array(fileReader.result as ArrayBuffer);
				};
				fileReader.readAsArrayBuffer(blob);
			});
		});
	}

	closePrintPreview() {
		this.closePreview.emit();
	}

	async downloadAsPdf() {
		await this.invoicePdfDocument.create().download(this.schoolInfo?.school?.schoolName + "_" + new Date().getTime() + ".pdf");
	}

	toggleCollectionView() {
		this.listCollections = !this.listCollections;
	}

}
