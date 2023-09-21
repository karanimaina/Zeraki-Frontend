import {Cell, Columns, Img, PdfMakeWrapper, Stack, Table, Txt} from "pdfmake-wrapper";
import * as pdfFonts from "pdfmake/build/vfs_fonts.js";
import { SchoolInfo } from "../../school-info";
import {SchoolTypeData} from "../../school-type-data";


export class MeritListPdfDoc {
	protected readonly pdfDocument!: PdfMakeWrapper;
	private schoolProfile: SchoolInfo;
	private schoolTypeData:SchoolTypeData;
	private docTitle: string;
	private examName:string;
	private meritTableHeaders: Array<any>;
	private readonly meritTableContent: Array<any>;
	private readonly summaryTableHeaders: Array<any>;
	private summaryTableContent: Array<any>;
	private readonly classSummaryTableHeaders: any;
	private classSummaryTableContent: any;
	private readonly showStudentScoreOnly: boolean;
	private readonly showKCPE: boolean;


	constructor(
		schoolProfile: SchoolInfo,
		schoolTypeData:SchoolTypeData,
		docTitle: string,
		examName:any,
		meritTableHeaders: any,
		meritTableContent: any,
		summaryTableHeaders: any,
		summaryTableContent: any,
		classSummaryTableHeaders: any,
		classSummaryTableContent: any,
		showStudentScoreOnly: boolean,
		showKCPE = true
	) {
		this.schoolProfile = schoolProfile;
		this.schoolTypeData = schoolTypeData;
		this.docTitle = examName;
		this.examName = examName;
		this.meritTableHeaders = meritTableHeaders;
		this.meritTableContent = meritTableContent;
		this.summaryTableHeaders = summaryTableHeaders;
		this.summaryTableContent = summaryTableContent;
		this.classSummaryTableHeaders = classSummaryTableHeaders;
		this.classSummaryTableContent = classSummaryTableContent;
		this.showStudentScoreOnly = showStudentScoreOnly;
		this.showKCPE = showKCPE;

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();

		this.initDocument();
	}

	async initDocument() {
		this.pdfDocument.pageOrientation("landscape");
		this.pdfDocument.pageSize("A4");
		this.pdfDocument.pageMargins([11, 11]);
	}

	private async headerSection() {
		let imageLoaded = true;
		let schoolLogo;
		try {
			schoolLogo = await new Img(`${this.schoolProfile.logo}?cacheblock=true`)
				.fit([55, 55])
				.alignment("left")
				.build();
		} catch (e) {
			imageLoaded = false;
		}

		const schoolTitle = new Txt(this.schoolProfile.name)
			.fontSize(16)
			.bold()
			.alignment("center")
			.end;

		const docTitle = new Txt(this.docTitle)
			.fontSize(13)
			.bold()
			.alignment("center")
			.margin([0, 4, 0, 0])
			.end;

		const schoolPOBox = new Txt(this.schoolProfile.address)
			.bold()
			.alignment("right")
			.end;
		const schoolPhone = new Txt(this.schoolProfile.address)
			.bold()
			.alignment("right")
			.margin([0, 3])
			.end;
		const schoolEmail = new Txt(this.schoolProfile.email)
			.bold()
			.alignment("right")
			.end;
		const schoolAddress = new Stack([
			schoolPOBox,
			schoolPhone,
			schoolEmail
		]).fontSize(10).end;

		return new Columns([
			(imageLoaded) ? schoolLogo : "",
			new Stack([schoolTitle, docTitle]).end,
			schoolAddress
		]).end;
	}

	public async build(): Promise<PdfMakeWrapper> {
		this.pdfDocument.add(await this.headerSection());
		this.pdfDocument.add(await this.studentMeritListSection());
		this.pdfDocument.add(await this.summaryMeritListSection());
		this.pdfDocument.add(await this.classSummaryMeritListSection());
		return this.pdfDocument;
	}

	private async studentMeritListSection() {
		// console.log(this.meritTableContent);
		const table = await this.getMeritListData();
		const widthOption: any = [];
		table[1].forEach((el: string, i: number) => {
			i == 1 ? widthOption.push("*") : widthOption.push("auto");
		});
		const meritTable = new Table(table)
			.widths(widthOption)
			.fontSize(6.5)
			.height("auto")
			.margin([0, 10, 0, 0])
			.headerRows(2)
			.dontBreakRows(true)
			.end;
		return meritTable;
	}

	private async summaryMeritListSection() {
		const summaryData = await this.getMeritListSummary();
		const widthOption: Array<any> = [];
		summaryData[0].forEach((e, i) => {
			if(this.schoolTypeData.isIvorianSchool || this.schoolTypeData.isGuineaSchool || this.schoolTypeData.isSouthAfricaPrimarySchool || this.schoolTypeData.isSouthAfricaSecondarySchool) {
				/*i == 0 || i > 14 ?*/ widthOption.push("*"); /*: widthOption.push(20);*/
			} else {
				i == 0 || i > 14 ? widthOption.push("*") : widthOption.push(20);
			}
		});
		const tableSummary = new Table(summaryData)
			.widths(widthOption)
			.fontSize(6.5)
			.height("auto")
			.margin([0, 10, 0, 0])
			.headerRows(2)
			.dontBreakRows(true)
			.end;

		return tableSummary;
	}

	private async classSummaryMeritListSection() {
		const summaryData = await this.getClassMeritListSummary();
		const widthOption: Array<any> = [];
		summaryData[0].forEach((e, i) => {
			if(this.schoolTypeData.isIvorianSchool || this.schoolTypeData.isGuineaSchool || this.schoolTypeData.isSouthAfricaPrimarySchool || this.schoolTypeData.isSouthAfricaSecondarySchool) {
				/*i == 0 || i > 14 ?*/ widthOption.push("*"); /*: widthOption.push(20);*/
			} else {
				i == 0 || i > 14 ? widthOption.push("*") : widthOption.push(20);
			}
		});
		const tableSummary = new Table(summaryData)
			.widths(widthOption)
			.fontSize(6.5)
			.height("auto")
			.margin([0, 10, 0, 0])
			.headerRows(2)
			.dontBreakRows(true)
			.end;

		return tableSummary;
	}

	private async getMeritListData() {
		//configure the header
		const headerArray: Array<any> = [];
		const headerLabelsArray: Array<any> = [];
		this.meritTableHeaders.forEach((table) => {
			headerArray.push(table.header);
			headerLabelsArray.push(table.label);
		});

		if (!this.showKCPE) {
			const index = headerArray.indexOf("KCPE");
			headerArray.splice(index, 1);
			headerLabelsArray.splice(index, 1);
		}

		const studentDataArray: Array<any> = [];
		this.meritTableContent.forEach((student, i) => {
			let studentRecordArray: any = [];
			headerLabelsArray.forEach((header, j) => {
				// studentRecordArray.push(
				// 	(student[header]?.score_grade) ? student[header].score_grade : student[header] || "-"
				// );

				let tableCellValue = "-";
				if (student[header]?.isSubjectMarks) {
					tableCellValue = this.showStudentScoreOnly ? student[header]?.score : student[header]?.score_grade;
				} else {
					tableCellValue = student[header];
				}

				studentRecordArray.push(tableCellValue ?? "");
			});
			studentDataArray.push(studentRecordArray);
			studentRecordArray = [];
		});
		studentDataArray.unshift(headerArray);
		const title:Array<any> =  this.getTitleRow(this.examName,headerArray);
		// console.log(title,studentDataArray[0])
		studentDataArray.unshift(title);
		return studentDataArray;
	}

	private async getMeritListSummary() {
		const meritSummary: Array<any> = [];
		this.summaryTableContent.forEach((content) => {
			let arraySummary: any = [];
			this.summaryTableHeaders?.map((header) => {
				arraySummary.push(content[header]?.toString().toUpperCase() || "");
			});
			meritSummary.push(arraySummary);
			arraySummary = [];
		});
		meritSummary.unshift(this.summaryTableHeaders);
		const title:Array<any> =  this.getTitleRow("GRADE BREAKDOWN",this.summaryTableHeaders);
		meritSummary.unshift(title);
		return meritSummary;
	}

	private async getClassMeritListSummary() {
		const meritSummary: Array<any> = [];
		this.classSummaryTableContent.forEach((content) => {
			let arraySummary: any = [];
			this.classSummaryTableHeaders.map((header) => {
				arraySummary.push(content[header] || "");
				header.toString().toUpperCase();
			});
			meritSummary.push(arraySummary);
			arraySummary = [];
		});

		meritSummary.unshift(this.classSummaryTableHeaders);
		const title:Array<any> =  this.getTitleRow("CLASS GRADE SUMMARY",this.classSummaryTableHeaders);
		meritSummary.unshift(title);
		return meritSummary;
	}

	getTitleRow(title: string, headerArray: Array<any>) {
		const titleRow:any = [];
		const length = headerArray.length;
		for (let i = 0; i < length; i++) {
			i == 0 ?
				titleRow.push(new Cell(new Txt(title).end)
					.colSpan(length)
					.alignment("center")
					.bold()
					.fontSize(7)
					.end)
				:
				titleRow.push(null);
		}
		return titleRow;
	}

}
