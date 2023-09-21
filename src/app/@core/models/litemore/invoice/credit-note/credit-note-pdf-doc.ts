import { Cell, Columns, QR, Table, Txt } from "pdfmake-wrapper";
import { Invoice } from "../invoice";
import { LitemoreSchoolProfile } from "../../school/litemore-school-profile";
import { BaseInvoicePdf } from "../base-invoice-pdf";
import { CreditNoteItem } from "./credit-note";
import { CompanyInfo } from "../company/company-info";

export class CreditNotePdfDoc extends BaseInvoicePdf {
	private creditNote!: CreditNoteItem;

	constructor(
		creditNote: CreditNoteItem,
		invoice: Invoice,
		schoolProfile: LitemoreSchoolProfile,
		kraPin: string,
		vatRate: string,
		companyInfo: CompanyInfo | undefined
	) {
		super(invoice, schoolProfile, kraPin, vatRate, companyInfo);
		this.creditNote = creditNote;
	}

	public async build() {
		this.pdfDocument.add(await this.getCreditNoteContent("CREDIT NOTE"));
		this.pdfDocument.add(this.getCreditNoteHeader());
		this.pdfDocument.add(this.getPinAndInvoiceNo());
		this.pdfDocument.add(this.getInvoiceDetails());
		this.pdfDocument.add(this.getCreditNoteDetails());
		this.pdfDocument.add(this.getQrAndInvoiceNumber());

		return this.pdfDocument;
	}

	private getCreditNoteHeader() {
		const noteTo = new Columns([
			new Txt("To:").bold().width("15%").alignment("left").end,
			new Txt(String(this.schoolProfile.school.schoolName))
				.color("#000000")
				.width("85%").end,
		]).end;

		const refNo = new Columns([
			new Txt("Ref No:").bold().alignment("left").end,
			new Txt(this.creditNote.creditNoteNumber)
				.color("#000000")
				.alignment("right").end,
		]).margin([0, 0, 0, 5]).end;

		const date = new Columns([
			new Txt("Date:").bold().alignment("left").end,
			new Txt(
				this.datePipe.transform(this.creditNote.createdOn, "dd/MM/yyyy") || ""
			)
				.color("#000000")
				.alignment("right").end,
		]).margin([0, 0, 0, 5]).end;

		return new Columns([[noteTo], [refNo, date]])
			.columnGap(15)
			.margin([0, 20, 0, 0]).end;
	}

	private getPinAndInvoiceNo() {
		const pin = new Columns([
			new Txt("PIN:").width("15%").bold().alignment("left").end,
			new Txt(this.kraPin).color("#000000").alignment("left").end,
		]).end;

		const invoiceNo = new Columns([
			new Txt("Relevant Inv No:").bold().alignment("left").end,
			new Txt(this.creditNote.invoiceNumber).color("#000000").alignment("right")
				.end,
		]).end;

		return new Columns([[pin], [invoiceNo]]).columnGap(15).margin([0, 0, 0, 20])
			.end;
	}

	private getInvoiceDetails() {
		return new Table([
			[
				new Txt("Item").bold().end,
				new Txt("Net Amount").bold().end,
				new Txt("VAT Rate").bold().end,
				new Txt("VAT Amount").bold().end,
				new Txt("Gross Amount").bold().end,
			],
			[
				new Txt(this.invoice.item || this.creditNote.item).color("#000000").end,
				new Txt(
					this.currencyPipe.transform(this.creditNote.netAmount) || ""
				).color("#000000").end,
				new Txt(this.vatRate).color("#000000").end,
				new Txt(
					this.currencyPipe.transform(this.creditNote.vatAmount) || ""
				).color("#000000").end,
				new Txt(
					this.currencyPipe.transform(this.creditNote.grossAmount) || ""
				).color("#000000").end,
			],
		])
			.widths(["40%", "15%", "15%", "15%", "15%"])
			.layout({
				hLineWidth: (i) => {
					return i == 2 ? 0.8 : 2;
				},
				vLineWidth: function () {
					return 0;
				},
				paddingTop: function (rowIndex) {
					return rowIndex == 0 ? 5 : 4;
				},
				paddingBottom: function (rowIndex) {
					return rowIndex == 0 ? 5 : 3;
				},
				hLineColor: function () {
					return "#14b41d";
				},
				fillColor: function (rowIndex) {
					return rowIndex == 0 ? "#def0d9" : "";
				},
			}).end;
	}

	private getCreditNoteDetails() {
		return new Table([
			[
				new Cell(new Txt("VAT Summary").bold().alignment("center").end).colSpan(
					4
				).end,
				[],
				[],
				[],
			],
			[
				new Txt("Amount Credited").bold().end,
				new Txt("VAT Rate").bold().end,
				new Txt("VAT Amount").bold().end,
				new Txt("Credit Note Amount ").bold().end,
			],
			[
				new Txt(
					this.currencyPipe.transform(this.creditNote.netAmount) || ""
				).color("#000000").end,
				new Txt(this.vatRate).color("#000000").end,
				new Txt(
					this.currencyPipe.transform(this.creditNote.vatAmount) || ""
				).color("#000000").end,
				new Txt(
					this.currencyPipe.transform(this.creditNote.grossAmount) || ""
				).color("#000000").end,
			],
		])
			.widths(["34%", "22%", "22%", "22%"])
			.headerRows(2)
			.layout({
				hLineWidth: () => {
					return 0.8;
				},
				vLineWidth: function () {
					return 0;
				},
				paddingTop: function () {
					return 4;
				},
				paddingBottom: function () {
					return 3;
				},
				hLineColor: function () {
					return "#14b41d";
				},
				fillColor: function (rowIndex) {
					return rowIndex == 2 ? "" : "#def0d9";
				},
			})
			.margin([0, 20, 0, 0]).end;
	}

	private getQrAndInvoiceNumber() {

		const qrCode = this.creditNote?.qrCodeUrl ? new QR(`${this.creditNote?.qrCodeUrl}`).foreground("green").fit(120).margin([0, 40, 0, 0]).alignment("center").width("60%").end : "";

		return new Columns([
			[
				qrCode,
				new Txt(this.creditNote?.cuSerialNumber || "").bold().alignment("center").margin([0, 30, 0, 0]).end,
				new Txt(this.creditNote?.cuInvoiceNumber || "").bold().alignment("center").end
			],

		]).end;

	}
}
