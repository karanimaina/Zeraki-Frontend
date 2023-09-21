import {Columns, Img, PdfMakeWrapper, Stack, Table, Txt} from "pdfmake-wrapper";
import * as pdfFonts from "pdfmake/build/vfs_fonts.js";
import {TranslateService} from "@ngx-translate/core";
import {CurrencyPipe} from "@angular/common";


export class ReceiptPdfDoc {

	private readonly pdfDocument: PdfMakeWrapper;
	private receiptNumber: number;
	private recipient: {
		school: string;
		phone: string;
		date: string;
		address1: string,
		address2: string
	};
	private from: {
		name: string;
		address: string;
		city: string;
		phone: string;
		email: string;
		kraPin: string;
	};
	private paymentInfo: any;
	private translate: TranslateService;
	protected currencyPipe: CurrencyPipe = new CurrencyPipe("en-US", "KES ");

	constructor(
		receiptNumber: number,
		recipient: any,
		paymentInfo: any,
		translate: TranslateService
	) {
		this.receiptNumber = receiptNumber;
		this.recipient = recipient;
		this.paymentInfo = paymentInfo;
		this.translate = translate;
		this.from = {
			name: "Litemore ltd",
			address: "P.O. Box 51235-00100",
			city: "Nairobi",
			phone: "+254 798 666 000",
			email: "info@litemore.co.ke",
			kraPin: "PIN : ABCDEF12SXW"
		};

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.pageOrientation("portrait");
		this.pdfDocument.pageSize("A4");
		this.pdfDocument.pageMargins([15, 15]);
		this.pdfDocument.defaultStyle({
			fontSize: 12,
		});
	}

	public async build() {
		this.pdfDocument.add(await this.getHeaderSection());
		this.pdfDocument.add(await this.getRecipientSection());
		this.pdfDocument.add(await this.getTableSection());
		this.pdfDocument.add(this.getTotal());
		this.pdfDocument.add(this.getComments());

		return this.pdfDocument;
	}

	private async getRecipientSection() {
		const school = new Stack([
			new Txt(` ${this.translate.instant("messages.receipt.receivedFrom")}`).end,
			new Txt(`${this.recipient.school}`).bold().end,
		]).margin([0, 7, 0, 3]).end;
		const address1 = (this.recipient.address1.length > 0) ?
			new Txt(` ${this.recipient.address1}`).margin([0, 3]).end
			: "";
		const address2 = (this.recipient.address2.length > 0) ?
			new Txt(` ${this.recipient.address2}`).margin([0, 3]).end
			: "";

		const phoneNumber = new Txt(` ${this.recipient.phone}`).margin([0, 3]).end;
		const date = new Txt(`${this.translate.instant("messages.receipt.receiptDate")} :  ${this.recipient.date.substring(4)}`).margin([0,5,0,0]).bold().end;
		const receiptNumber = new Txt("Receipt Number: " + this.receiptNumber).bold().margin([0, 4,0,0]).end;


		return new Stack([
			school, address1, address2, phoneNumber,date, receiptNumber
		]).alignment("left").end;
	}

	private async getHeaderSection() {
		const receiptTitle = new Txt("Receipt").fontSize(28).color("#003265").margin([0, 3]).bold().end;
		const companyName = new Txt("Litemore Limited.").margin([0, 7, 0, 1]).bold().end;
		const companyAddress = new Txt("P.O. Box 51235-00100").margin([0, 4, 0, 2]).end;
		const companyPostalAddress = new Txt("Nairobi, Kenya 0798 666 000").margin([0, 2, 0, 2]).end;
		const companyEmail = new Txt("info@litemore.co.ke").margin([0, 2, 0, 2]).end;
		// const taxPayersPin = new Txt("Tax Payer's PIN: " + "this.kraPin").bold().margin([0, 4, 0, 0]).end;

		const addressColumn = new Columns([
			[companyName, companyAddress, companyPostalAddress, companyEmail/*, taxPayersPin*/]
		]).width("40%").alignment("left").end;

		const companyLogo = await new Img("../../../../../assets/img/litemore_logo_cropped.png").fit([240, 240]).alignment("right").width("60%").build();

		return new Columns([
			new Columns([
				[receiptTitle, addressColumn],
				companyLogo
			]).end
		]).fontSize(14).color("#000000").end;
	}

	private async getTableSection() {

		return new Table(await this.getTableData())
			.widths(["*", "auto", "auto", "auto", "auto"])
			.heights(15)
			.margin([0, 10])
			.layout({
				hLineWidth: (i: any) => {
					return i > 1 ? 0.8 : 1.2;
				},
				paddingTop: function () {
					return 5;
				},
				paddingBottom: function () {
					return 5;
				},
				hLineColor: function () {
					return "#43ab49";
				},
				vLineColor: function () {
					return "#43ab49";
				},
				fillColor: function (rowIndex) {
					return rowIndex == 0 ? "#def0d9" : "";
				}
			}).end;
	}

	async getTableData() {
		const tableHeaders = [
			new Txt(this.translate.instant("messages.receipt.description")).bold().end,
			new Txt(this.translate.instant("messages.receipt.invoiceNumber")).bold().end,
			new Txt(this.translate.instant("messages.receipt.transactionNo")).bold().end,
			new Txt(this.translate.instant("messages.receipt.transactionDate")).bold().end,
			new Txt(this.translate.instant("messages.receipt.amount")).bold().end,
		];
		const tableBody = [
			new Txt(this.translate.instant("messages.receipt.purchaseOfSmsCredits")).bold().end,
			this.paymentInfo.phone || "",
			this.paymentInfo.code || "",
			this.paymentInfo.date.substring(4) || "",
			this.currencyPipe.transform(this.paymentInfo?.amount) || ""
		];

		return [tableHeaders, tableBody];
	}

	private getTotal() {
		const receiptTotal = new Txt([
			new Txt(`${this.translate.instant("messages.receipt.total")}: `).bold().end,
			new Txt(this.currencyPipe.transform(this.paymentInfo?.amount) || "").end,
		]).end;
		return new Columns([
			receiptTotal
		]).alignment("right").margin([0, 10]).end;
	}

	private getComments() {
		const comments = new Txt(this.translate.instant("messages.receipt.smsCharges")).bold().end;
		return new Columns([
			comments
		]).alignment("left").fontSize(8).margin([0, 50, 0, 0]).end;
	}

}
