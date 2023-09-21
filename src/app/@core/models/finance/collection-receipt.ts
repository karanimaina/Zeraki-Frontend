import { CurrencyPipe, DatePipe, TitleCasePipe } from "@angular/common";
import { Cell, Columns, Img, PdfMakeWrapper, Stack, Table, Txt } from "pdfmake-wrapper";
import { SchoolInfo } from "../school-info";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { NormalizeTextPipe, NumberToWordsPipe, StreamsPipe } from "../../shared";
import { FinanceService } from "../../services/finance/finance.service";
import { AppInjector } from "src/app/app.module";

export class CollectionReceiptDoc {
	protected readonly pdfDocument!: PdfMakeWrapper;
	studentData: any;
	collection: any;
	schoolInfo: SchoolInfo;
	protected datePipe: DatePipe = new DatePipe("en-US");
	protected streamPipe: StreamsPipe = new StreamsPipe(AppInjector.get(FinanceService));
	protected normalizeTextPipe: NormalizeTextPipe = new NormalizeTextPipe();
	protected currencyPipe: CurrencyPipe = new CurrencyPipe("en-US", "KES ");
	protected numberToWordsPipe: NumberToWordsPipe = new NumberToWordsPipe();
	protected titleCasePipe: TitleCasePipe = new TitleCasePipe();

	constructor(studentData: any, collection: any, schoolInfo: SchoolInfo) {
		this.studentData = studentData;
		this.collection = collection;
		this.schoolInfo = schoolInfo;

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.pageOrientation("portrait");
		this.pdfDocument.pageMargins([40, 40, 40, 40]);
		this.pdfDocument.defaultStyle({
			fontSize: 11,
			color: "#003265",
		});
	}

	async buildReport() {
		this.pdfDocument.add(await this.getReceiptHeader());
		this.pdfDocument.add(this.studentAndPaymentInfo());
		this.pdfDocument.add(this.getPaymentDistribution());
		this.pdfDocument.add(this.getBalance());
        
		return this.pdfDocument;
	}

	private async getReceiptHeader() {
		const schoolLogo = await new Img(`${this.schoolInfo?.logo}?cacheblock=true` || "").fit([80, 80]).alignment("left").margin(0).build();

		const schoolName = new Txt(this.schoolInfo?.name).color("#003265").bold().end;
		const schoolAddress = new Txt(this.schoolInfo?.address).end;
		const schoolPhone = new Txt(this.schoolInfo?.phone).end;
		const schoolEmail = new Txt(this.schoolInfo?.email).end;

		const infoStack = new Stack([
			schoolName, schoolAddress, schoolPhone, schoolEmail
		]).margin([-30, 5, 0, 0]).end;

		const addressColumn = new Columns([
			schoolLogo,
			infoStack
		]).width("40%").end;

		const receiptText = new Txt("Receipt No").end;
		const receiptNo = new Txt(`${this.collection?.receiptNumber}`).fontSize(20).bold().margin([0, 4, 0, 0]).end;
		const receiptDate = new Txt(`${this.datePipe.transform(this.collection.txnDate, "longDate", "+0300")}`).margin([0, 4, 0, 0]).end;

		const receiptColumn = new Columns([
			[receiptText, receiptNo, receiptDate]
		]).alignment("right").width("60%").end;

		return new Columns([
			addressColumn,
			receiptColumn
		]).margin([0, 20]).end;
	}

	private studentInfo() {
		const studentText = new Txt("Student").margin([0, 0, 0, 5]).end;
		const studentName = new Txt(this.collection.studentName || this.studentData?.studentName).color("#003265").bold().end;
		const studentAdmno = new Txt(`Adm No. ${this.collection.admissionNo}`).end;
		const studentStream = new Txt(`${this.collection.intakeName} ${this.studentData.currentStreamName}`).end;


		return new Stack([
			[studentText, studentName, studentAdmno, studentStream],
		]).alignment("left").end;
	}

	private paymentInfo() {
		const paymentText = new Txt("Payment Info").margin([0, 0, 0, 5]).fontSize(8).end;
		const paymentMode = new Txt([
			new Txt("Mode Of Payment:").bold().end,
			new Txt(this.normalizeTextPipe.transform(this.collection.paymentMethod)).end
		]).color("#003265").bold().end;
		const paymentAccount = new Txt([
			new Txt("Account: ").bold().end,
			new Txt(this.collection.cashbookName.toUpperCase()).end
		]).color("#003265").bold().end;
		const transactionCode = new Txt(`${this.collection.refNo || ""}`).end;


		return new Stack([
			[paymentText, paymentMode, paymentAccount, transactionCode],
		]).width("40%").end;
	}

	private studentAndPaymentInfo() {
		return new Columns([
			this.studentInfo(),
			this.paymentInfo()
		]).margin([0, 20]).end;
	}

	private getPaymentDistribution() {
		return new Table([
			[
				new Txt("#").bold().end,
				new Txt("Vote Head").bold().end,
				new Txt("Amount").bold().end,
			],
			...this.tableData
		]).widths(["20%", "50%", "30%",]).layout({
			hLineWidth: (i: any) => {
				return 0.8;
			},
			vLineWidth: function () {
				return 0.8;
			},
			paddingTop: function () {
				return 5;
			},
			paddingBottom: function () {
				return 5;
			},
			hLineColor: function () {
				return "#000000";
			},
			vLineColor: function () {
				return "#000000";
			},
			fillColor: function (rowIndex) {
				return rowIndex == 0 ? "#def0d9" : "";
			}
		}).margin([0, 20]).end;
	}

	get tableData() {
		const tableContent = this.collection.feeItemsList.map((feeItem, index) => {
			return [
				new Txt(index + 1).end,
				new Txt(feeItem.particular || feeItem.voteHeadName || "").end,
				new Txt(this.currencyPipe.transform(feeItem.amount) || "").end,
			];
		});

		const tableTotal = [
			[
				new Cell(
					new Txt("Total").end
				).colSpan(2).end,
				null,
				new Cell(
					new Txt(this.currencyPipe.transform(this.collection.amount) || "").end
				).colSpan(1).end
			],
		];

		const tableFooter = [
			...tableContent,
			...tableTotal,
			[
				new Cell(
					new Txt(this.currencyPipe.transform(this.collection.amount) || "").end
				).colSpan(3).alignment("right").end
			]
		];

		return tableFooter;
	}

	private getBalance() {
		return new Stack([
			new Txt([
				new Txt("Balance: ").end,
				new Txt(`${this.collection.amountDue}`).bold().end
			]).end,
			new Txt([
				new Txt(this.collection.amountDue < 0? "Overpaid ": "").end,
				new Txt(this.titleCasePipe.transform(this.numberToWordsPipe.transform(this.collection.amountDue))).end,
				new Txt(" shillings only").end
			]).end
		]).alignment("right").end;
	}

}