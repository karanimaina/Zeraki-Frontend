import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PdfMakeWrapper } from "pdfmake-wrapper";
import { CompanyInfo } from "src/app/@core/models/litemore/invoice/company/company-info";
import { CreditNoteItem } from "src/app/@core/models/litemore/invoice/credit-note/credit-note";
import { CreditNotePdfDoc } from "src/app/@core/models/litemore/invoice/credit-note/credit-note-pdf-doc";
import { Invoice } from "src/app/@core/models/litemore/invoice/invoice";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";

@Component({
	selector: "app-credit-note-print-preview",
	templateUrl: "./credit-note-print-preview.component.html",
	styleUrls: ["./credit-note-print-preview.component.scss"],
})
export class CreditNotePrintPreviewComponent implements OnInit {
	@Input() creditNote!: CreditNoteItem;
	@Input() invoice!: Invoice;
	@Input() schoolInfo!: LitemoreSchoolProfile;
	@Input() kraPin!: string;
	@Input() vatRate!: string;
	@Input() companyInfo?: CompanyInfo;


	@Output() closeCreditNotePreview: EventEmitter<void> =
		new EventEmitter<void>();

	private pdfDocument!: PdfMakeWrapper;
	private creditNotePdfDoc!: CreditNotePdfDoc;
	pdfSrc!: Uint8Array;
	constructor() {}

	ngOnInit(): void {
		this.generateCreditNotePdf();
	}

	private generateCreditNotePdf() {
		this.creditNotePdfDoc = new CreditNotePdfDoc(
			this.creditNote,
			this.invoice,
			this.schoolInfo,
			this.kraPin,
			this.vatRate,
			this.companyInfo
		);
		this.creditNotePdfDoc.build().then((pdfDoc: PdfMakeWrapper) => {
			this.pdfDocument = pdfDoc;
			this.pdfDocument.create().getBlob((blob) => {
				const fileReader = new FileReader();
				fileReader.onload = () => {
					this.pdfSrc = new Uint8Array(fileReader.result as ArrayBuffer);
				};
				fileReader.readAsArrayBuffer(blob);
			});
		});
	}

	downloadCreditNote() {
		this.pdfDocument
			.create()
			.download(
				this.schoolInfo.school.schoolName +
					"_" +
					this.creditNote.creditNoteNumber +
					".pdf"
			);
	}

	closePreview() {
		this.closeCreditNotePreview.emit();
	}
}
