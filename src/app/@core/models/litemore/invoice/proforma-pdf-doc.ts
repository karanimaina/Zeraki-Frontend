import { Columns, Table, Txt } from "pdfmake-wrapper";
import { LitemoreSchoolProfile } from "../school/litemore-school-profile";
import { PaymentInfo } from "./account/account-info";
import { BaseInvoicePdf } from "./base-invoice-pdf";
import { CompanyInfo } from "./company/company-info";

export class ProformaPdfDoc extends BaseInvoicePdf {

	paymentInfo?: PaymentInfo;

	constructor(proforma: any, schoolProfile: LitemoreSchoolProfile, companyInfo: CompanyInfo | undefined, paymentInfo: PaymentInfo | undefined) {
		super(proforma, schoolProfile, proforma.kraPin, proforma.vat, companyInfo);
		this.paymentInfo = paymentInfo;
	}

	public async build() {
		this.pdfDocument.add(await this.getCreditNoteContent("PROFORMA"));
		this.pdfDocument.add(this.getInvoiceHeader());
		this.isKenyanSchool ? this.pdfDocument.add(this.getProformaDetails()) : this.pdfDocument.add(this.getNonKenyanProformaDetails());
		this.pdfDocument.add(this.getInvoiceBalance());

		// console.warn(this.paymentInfo);
		if (this.paymentInfo) this.pdfDocument.add(this.getPaymentInfo());
		// if (this.schoolProfile.balance > 0 || this.schoolProfile.balance < 0) this.pdfDocument.add(this.getOverpayment());

		return this.pdfDocument;
	}

	private getInvoiceHeader() {
		const noteTo = new Columns([
			new Txt("To:").bold().width("15%").alignment("left").end,
			new Txt(String(this.schoolProfile?.school?.schoolName)).color("#000000").width("85%").end
		]).end;

		const date = new Columns([
			new Txt("Date:").bold().alignment("left").end,
			new Txt(this.invoice?.creationDate).color("#000000").alignment("right").end
		]).margin([0, 0, 0, 10]).end;

		const dueDate = new Columns([
			new Txt("Due Date:").bold().alignment("left").end,
			new Txt(this.invoice?.dueDate).color("#000000").alignment("right").end
		]).margin([0, 0, 0, 10]).end;

		return new Columns([
			[noteTo],
			[date, dueDate]
		]).columnGap(15).margin([0, 20, 0, 0]).end;
	}

	private getProformaDetails() {
		return new Table([
			[
				new Txt("Number").bold().end,
				new Txt("Description").bold().end,
				new Txt("Net Amount").bold().end,
				new Txt("VAT Rate").bold().end,
				new Txt("VAT Amount").bold().end,
				new Txt("Gross Amount").bold().end
			],
			...this.tableData
		]).widths(["15%", "30%", "16%", "9%", "13%", "16%"]).layout({
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

	get tableData() {
		const tableData: any = [];
		this.invoice.proformaItems.map((proforma, index) => {
			const data = [
				new Txt(proforma?.proformaNumber || "").bold().end,
				new Txt(proforma?.item || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(proforma?.netAmount) || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(proforma?.vat) || "").color("#000000").end,
				new Txt(this.currencyPipe.transform(proforma?.grossAmount) || "").color("#000000").end
			];

			if (this.isKenyanSchool) {
				data.splice(3, 0, new Txt(this.invoice?.vatRate || "").color("#000000").end);
			}
			tableData.push(data);
		});

		const totalAmountData: any = [
			new Txt("Total").bold().end,
			"",
			"",
			"",
			new Txt(this.currencyPipe.transform(this.invoice?.grossAmount) || "").bold().end
		];
		if (this.isKenyanSchool) {
			totalAmountData.splice(3, 0, "");
		}

		tableData.push(totalAmountData);

		return tableData;
	}

	private getNonKenyanProformaDetails() {
		return new Table([
			[
				new Txt("Number").bold().end,
				new Txt("Description").bold().end,
				new Txt("Net Amount").bold().end,
				new Txt("VAT Amount").bold().end,
				new Txt("Gross Amount").bold().end
			],
			...this.tableData
		]).widths(["15%", "21%", "22%", "20%", "22%"]).layout({
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

	private getInvoiceBalance() {
		const total = new Columns([
			new Txt("Balance:").bold().fontSize(14).alignment("right").end,
			new Txt(this.currencyPipe.transform(this.invoice?.balance) || "").fontSize(15).bold().alignment("right").end
		]).margin([0, 0, 0, 10]).end;

		return new Columns([
			[],
			[total]
		]).columnGap(5).margin([0, 35, 0, 0]).end;
	}

	private getOverpayment() {
		const balance = new Columns([
			this.schoolProfile.balance < 0 ? new Txt("Overpayment:").bold().fontSize(15).alignment("right").color("#43ab49").end
				: new Txt("Balance:").bold().fontSize(15).alignment("right").color("#ff3f3f").end,
			new Txt(this.currencyPipe.transform(Math.abs(this.schoolProfile.balance)) || "").fontSize(15).bold().color(this.schoolProfile.balance < 0 ? "#43ab49" : "#ff3f3f").alignment("right").end
		]).margin([0, 0, 0, 10]).end;

		return new Columns([
			[],
			[balance]
		]).columnGap(5).margin([0, 20, 0, 0]).end;
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
		]).margin([0, 150, 0, 0]).color("#000000").end;
	}
}
