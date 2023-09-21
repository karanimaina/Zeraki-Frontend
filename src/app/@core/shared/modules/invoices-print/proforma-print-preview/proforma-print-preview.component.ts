import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PdfMakeWrapper } from "pdfmake-wrapper";
import { PaymentInfo } from "src/app/@core/models/litemore/invoice/account/account-info";
import { CompanyInfo } from "src/app/@core/models/litemore/invoice/company/company-info";
import { ProformaPdfDoc } from "src/app/@core/models/litemore/invoice/proforma-pdf-doc";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";

@Component({
	selector: "app-proforma-print-preview",
	templateUrl: "./proforma-print-preview.component.html",
	styleUrls: ["./proforma-print-preview.component.scss"]
})
export class ProformaPrintPreviewComponent implements OnInit {
	@Input() userInit: any;
	@Input() schoolInfo!: LitemoreSchoolProfile;
	@Input() proforma!: any;
	@Input() companyInfo?: CompanyInfo;
	@Input() paymentInfo?: PaymentInfo;

	@Output() closePreview: EventEmitter<void> = new EventEmitter();

	proformaPdfDocument!: PdfMakeWrapper;
	pdfSrc!: Uint8Array;
	private routeParams: any;

	constructor(private activatedRoute: ActivatedRoute) { }

	ngOnInit(): void {
		this.routeParams = this.activatedRoute.snapshot.params;

		this.generateInvoicePdf();
	}

	private generateInvoicePdf() {
		const pdfDoc = new ProformaPdfDoc(this.proforma, this.schoolInfo, this.companyInfo, this.paymentInfo);

		pdfDoc.build().then((pdfDoc: PdfMakeWrapper) => {
			this.proformaPdfDocument = pdfDoc;
			this.proformaPdfDocument.create().getBlob((blob) => {
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
		await this.proformaPdfDocument.create().download(this.schoolInfo?.school?.schoolName + "_" + new Date().getTime() + ".pdf");
	}

}
