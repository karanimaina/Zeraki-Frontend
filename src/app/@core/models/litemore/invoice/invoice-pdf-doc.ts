import { Cell, Columns, QR, Table, Txt } from "pdfmake-wrapper";
import { LitemoreSchoolProfile } from "../school/litemore-school-profile";
import { Invoice } from "./invoice";
import { BaseInvoicePdf } from "./base-invoice-pdf";
import { CompanyInfo } from "./company/company-info";
import { PaymentInfo } from "./account/account-info";

export class InvoicePdfDoc extends BaseInvoicePdf {
	paymentInfo?: PaymentInfo;

	constructor(invoice: Invoice, schoolProfile: LitemoreSchoolProfile | any, kraPin: string, vatRate: string, companyInfo: CompanyInfo | undefined, paymentInfo?: PaymentInfo) {
		super(invoice, schoolProfile, kraPin, vatRate, companyInfo);
		this.paymentInfo = paymentInfo;
	}

	public async build() {
		this.pdfDocument.add(await this.getCreditNoteContent("INVOICE"));
		this.pdfDocument.add(this.getInvoiceHeader());

		this.pdfDocument.add(this.getPinAndInvoiceNo());
		this.pdfDocument.add(this.getInvoiceDetails());
		this.pdfDocument.add(this.getVATSummary());
		this.pdfDocument.add(this.getInvoiceSummary());

		if (this.paymentInfo) this.pdfDocument.add(this.getPaymentInfo());

		this.pdfDocument.add(this.getQrAndInvoiceNumber());

		return this.pdfDocument;
	}

	private getInvoiceHeader() {
		const noteTo = new Columns([
			new Txt("To:").bold().width("15%").alignment("left").end,
			new Txt(String(this.schoolProfile?.school?.schoolName || this.schoolProfile?.name)).color("#000000").width("85%").end
		]).end;

		const date = new Columns([
			new Txt("Date:").bold().alignment("left").end,
			new Txt(this.invoice?.creationDate).color("#000000").alignment("right").end
		]).margin([0, 0, 0, 10]).end;

		return new Columns([
			[noteTo],
			[date]
		]).columnGap(15).margin([0, 20, 0, 0]).end;
	}

	private getPinAndInvoiceNo() {
		const pin = new Columns([
			new Txt("PIN:").width("15%").bold().alignment("left").end,
			new Txt("").color("#000000").alignment("left").end
		]).end;

		const invoiceNo = new Columns([
			new Txt("Due Date:").bold().alignment("left").end,
			new Txt(this.invoice.dueDate).color("#000000").alignment("right").end
		]).end;

		return new Columns([
			[pin],
			[invoiceNo]
		]).columnGap(15).margin([0, 0, 0, 20]).end;
	}

	private getInvoiceDetails() {
		return new Table([
			[
				new Txt("Item").bold().end,
				new Txt("Net Amount").bold().end,
				new Txt("VAT Rate").bold().end,
				new Txt("VAT Amount").bold().end,
				new Txt("Gross Amount").bold().end
			],
			...this.tableData
		]).widths(["28%", "18%", "18%", "18%", "18%"]).layout({
			hLineWidth: (i: any) => {
				return i > 1 ? 0.8 : 2;
			},
			vLineWidth: function () {
				return 0;
			},
			paddingTop: function () {
				return 5;
			},
			paddingBottom: function () {
				return 5;
			},
			hLineColor: function () {
				return "#14b41d";
			},
			fillColor: function (rowIndex) {
				return rowIndex == 0 ? "#def0d9" : "";
			}
		}).end;
	}

	private getVATSummary() {
		return new Table([
			[
				new Cell(new Txt("VAT Summary").bold().alignment("center").end).colSpan(4).end,
				[], [], []
			],
			[
				new Txt("Amount Charged").bold().end,
				new Txt("VAT Rate").bold().end,
				new Txt("VAT Amount").bold().end,
				new Txt("Invoice Amount ").bold().end,
			],
			...this.vatDataSummary
		]).widths(["34%", "22%", "22%", "22%"]).headerRows(2).layout({
			hLineWidth: () => {
				return 0.8;
			},
			vLineWidth: function () {
				return 0;
			},
			paddingTop: function () {
				return 5;
			},
			paddingBottom: function () {
				return 5;
			},
			hLineColor: function () {
				return "#14b41d";
			},
			fillColor: function (rowIndex: any) {
				return rowIndex > 1 ? "" : "#def0d9";
			}
		}).margin([0, 20, 0, 0]).end;
	}

	private getInvoiceSummary() {
		const summaryTable = new Table([
			[
				new Txt("Invoice Total").end,
				new Txt(this.currencyPipe.transform(this.invoice.invoiceAmount || this.invoice.grossAmount) || "").end,
			],
			[
				new Txt("Payment").end,
				new Txt(this.currencyPipe.transform(this.invoice.amountCollected) || "").end,
			],
			[
				new Txt("Credit Note").end,
				new Txt(this.currencyPipe.transform(this.invoice.creditNoteTotal) || "").end,
			],
			[
				new Txt("Balance Due").end,
				new Txt(this.currencyPipe.transform(this.invoice.amountRemaining || this.invoice.balance) || "").end,
			],
		]).widths(["50%", "50%"]).layout({
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
				return 4;
			},
			hLineColor: function () {
				return "#14b41d";
			}
		}).color("#000000").margin([0, 20, 0, 0]).end;

		return new Columns([
			[],
			summaryTable
		]).end;
	}

	private getQrAndInvoiceNumber() {
		// QR Code alternate creation method
		// this.invoice?.qrCodeUrl? this.invoice.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data='${this.invoice.qrCodeUrl}'&size=150x150`: "";
		// const qrCode = this.invoice?.qrCodeUrl ? await new Img(`${this.invoice?.qrCodeUrl}`).fit([150, 150]).margin([0, 40, 0, 0]).alignment("center").width("60%").build() : "";

		const qrCode = this.invoice?.qrCodeUrl ? new QR(`${this.invoice?.qrCodeUrl}`).foreground("green").fit(120).margin([0, 40, 0, 0]).alignment("center").width("60%").end : "";
		return new Columns([
			[
				qrCode,
				new Txt(this.invoice?.cuSerialNumber || "").bold().alignment("center").margin([0, 30, 0, 0]).end,
				new Txt(this.invoice?.cuInvoiceNumber || "").bold().alignment("center").end
			],
		]).end;
	}

	get tableData() {
		return this.invoice.invoiceItems.map(invoice => {
			return [
				new Txt(invoice.item || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(invoice?.netAmount) || "").color("#000000").end,
				new Txt(this.invoice?.vatRate || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(invoice?.vat) || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(invoice?.invoiceAmount) || "").color("#000000").end
			];
		});
	}

	get vatDataSummary() {
		return this.invoice.invoiceItems.map(invoice => {
			return [
				new Txt(this.currencyPipe.transform(invoice.netAmount) || "").color("#000000").end,
				new Txt(this.invoice.vatRate).color("#000000").end,
				new Txt(this.currencyPipe.transform(invoice.vat) || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(invoice.invoiceAmount) || "").color("#000000").end
			];
		});
	}

	protected getPaymentInfo() {
		const payTo = new Txt(this.translateService.instant("invoice.proformaInvoice.payTo")).margin([0, 5]).bold().end;
		const accountName = new Txt([
			new Txt(`${this.translateService.instant("invoice.proformaInvoice.accountName")}: `).end,
			new Txt(this.paymentInfo?.accountName || "").end,
		]).margin([0, 1]).end;
		const accountNumber = new Txt([
			new Txt(`${this.translateService.instant("invoice.proformaInvoice.accountNumber")}: `).end,
			new Txt(this.paymentInfo?.accountNumber || "").end,
		]).margin([0, 1]).end;
		const bankName = new Txt([
			new Txt(`${this.translateService.instant("invoice.proformaInvoice.bank")}: `).end,
			new Txt(this.paymentInfo?.bankName || "").end,
		]).margin([0, 1]).end;


		const addressColumn = new Columns([
			[payTo, accountName, accountNumber, bankName]
		]).alignment("left").end;

		return new Columns([
			[addressColumn],
			[]
		]).margin([0, 20, 0, 0]).color("#000000").end;
	}
}
