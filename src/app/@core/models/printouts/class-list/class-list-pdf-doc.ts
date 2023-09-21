import { TranslateService } from "@ngx-translate/core";
import {
	Cell,
	Columns,
	Img,
	ITable,
	IText,
	PdfMakeWrapper,
	Stack,
	Table,
	Txt
} from "pdfmake-wrapper";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AppInjector } from "src/app/app.module";
import { SchoolInfo } from "../../school-info";

export class ClassListPdfDoc {
	protected readonly pdfDocument!: PdfMakeWrapper;
	private pageSize: string;
	private docTitle: string;
	private school: SchoolInfo;
	private documentHeaders: Array<{ key: string, value: string, widthClass?: string }>;
	private tableHeaders: Array<string>;
	private tableContent: Array<Array<any>>;
	private selectedIntake: string;
	private readonly classTeacher: string;
	private readonly showStudentImages: boolean;
	private readonly showRepeatingHeaders: boolean;
	private readonly emptySlots = ["", "", "", ""];
	private headerRowsCount = 0;
	translate = AppInjector.get(TranslateService);

	constructor(
		docTitle: string,
		school: SchoolInfo,
		documentHeaders: Array<{ key: string, value: string, widthClass?: string }>,
		tableContent: Array<Array<any>>,
		selectedIntake: string,
		classTeacher = "",
		showStudentImages = false,
		showRepeatingHeaders = false,
		pageSize = "A4"
	) {
		this.pageSize = pageSize;
		this.docTitle = docTitle;
		this.school = school;
		this.selectedIntake = selectedIntake.trim();
		this.classTeacher = classTeacher;
		this.showStudentImages = showStudentImages;
		this.showRepeatingHeaders = showRepeatingHeaders;
		this.documentHeaders = [...documentHeaders];
		this.tableHeaders = this.documentHeaders.map((item) => item["value"]);
		this.tableContent = tableContent;

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();

		this.initDocument();
	}

	initDocument() {
		this.pdfDocument.pageOrientation("portrait");
		this.pdfDocument.pageSize("");
		this.pdfDocument.defaultStyle({
			fontSize: 7.5
		});
		this.pdfDocument.pageMargins([20, 10]);
	}

	public async build() {
		this.pdfDocument.add(await this.getDocumentHeader());
		this.pdfDocument.add(await this.getDocumentBody());
		return this.pdfDocument;
	}

	private async getDocumentHeader() {
		let imageLoaded = false;
		let schoolLogo;
		if (this.school?.logo) {
			try {
				schoolLogo = await new Img(`${this.school?.logo}?cacheblock=true`)
					.fit([60, 60])
					.alignment("left")
					.style(["border-radius", "5"])
					.build();
				imageLoaded = true;
			} catch (e) {
				imageLoaded = false;
			}
		}

		const schoolTitle = new Txt(this.school?.name?.trim())
			.fontSize(14)
			.bold()
			.alignment("center").end;

		const docTitle = new Txt(this.docTitle)
			.fontSize(12)
			.bold()
			.alignment("center")
			.margin([0, 4, 0, 0]).end;

		const schoolPOBox = new Txt(this.school.address.trim())
			.bold()
			.alignment("right").end;
		const schoolPhone = new Txt(this.school.phone.trim())
			.bold()
			.alignment("right")
			.margin([0, 3]).end;
		const schoolEmail = new Txt(this.school.email.trim())
			.bold()
			.alignment("right").end;
		const schoolAddress = new Stack([
			schoolPOBox,
			schoolPhone,
			schoolEmail
		]).fontSize(10).end;

		const logoObject = imageLoaded ? schoolLogo : "";
		return new Columns([
			logoObject,
			new Stack([schoolTitle, docTitle]).end,
			schoolAddress
		]).margin([0, 0, 0, 15]).end;
	}

	private async getDocumentBody() {
		// console.table(this.documentHeaders);
		const widthOption: Array<string> = new Array<string>();
		const imagePosition = this.documentHeaders.map(header => header.key).indexOf("url");
		const hashPosition = this.documentHeaders.map(header => header.key).indexOf("#");

		if (imagePosition !== -1 && !this.showStudentImages) {
			this.documentHeaders.splice(imagePosition, 1);
		}
		if (hashPosition !== -1) {
			this.documentHeaders.splice(hashPosition, 1);
		}


		this.tableHeaders = this.documentHeaders.map((item) => item["value"]);
		this.tableContent = await this.sortTableContent();

		const limit = this.getTableStyleLimit();
		this.tableHeaders = ["#",...this.documentHeaders.map((item) => item["value"]), ...this.emptySlots];
		this.tableHeaders.forEach((el: string, i: number) => {
			i <= limit ? widthOption.push("auto") : widthOption.push("*");
		});


		this.tableContent.unshift(this.tableHeaders);
		this.increaseHeaderRowsCount();
		const tableData: ITable = new Table(await this.getTableDetails())
			.widths(widthOption)
			.dontBreakRows(true)
			.headerRows(this.headerRowsCount)
			.height("*")
			.end;

		return new Columns([tableData]).fontSize(8).end;
	}

	getTableStyleLimit() {
		return this.tableHeaders.length - 1;
	}

	private increaseHeaderRowsCount() {
		this.headerRowsCount++;
	}

	private async getTableDetails() {
		//setup header section
		const selectedIntake: IText = new Txt(this.selectedIntake?.toUpperCase())
			.alignment("center")
			.bold().end;

		const classTeacher: IText = new Txt(this.classTeacher?.toUpperCase())
			.alignment("center")
			.bold().end;

		const contentWidth = this.tableContent[0].length;
		const cellIntakeContent: Array<any> = [];
		const cellClassTeacherContent: Array<any> = [];

		for (let i = 0; i < contentWidth; i++) {
			if (i === 0) {
				cellIntakeContent.push(
					new Cell(selectedIntake).colSpan(contentWidth).end
				);
				cellClassTeacherContent.push(
					new Cell(classTeacher).colSpan(contentWidth).end
				);
			} else {
				cellIntakeContent.push(null);
				cellClassTeacherContent.push(null);
			}
		}

		if (this.classTeacher !== "") {
			this.tableContent.unshift(cellClassTeacherContent);
			this.increaseHeaderRowsCount();
		}

		if (this.selectedIntake.length > 0) {
			this.tableContent.unshift(cellIntakeContent);
			this.increaseHeaderRowsCount();
		}

		return this.tableContent;
	}

	private async sortTableContent() {
		const contentAsArray: Array<Array<any>> = [];
		let iContent: any = [];
		const contactPosition = this.documentHeaders.map(header => header.key).indexOf("phone");
		const streamPosition = this.documentHeaders.map(header => header.key).indexOf("stream");
		if (
			contactPosition >= 0 ||
			streamPosition >= 0
		)this.emptySlots.pop();

		let i = 0;
		for (const student of this.tableContent) {
			iContent.push(String(i + 1));
			for (const header of this.documentHeaders) {

				if (header.key == "url") {
					const url = student["url"]
						? student["url"]
						: "./../../../../../assets/img/avatar/p_avatar_blue.png";
					iContent.push(await new Img(url).fit([35, 35]).build());
					continue;
				}

				iContent.push(student[header.key]?? "");
			}
			contentAsArray.push([...iContent, ...this.emptySlots]);
			iContent = [];
			i += 1;
		}
		// console.log("contentAsArray", contentAsArray);
		return contentAsArray;
	}
}
