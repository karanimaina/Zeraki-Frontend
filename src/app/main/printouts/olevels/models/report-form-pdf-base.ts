import {Canvas, Cell, Columns, IStack, Line, PdfMakeWrapper, Stack, Table, Txt} from "pdfmake-wrapper";
import {SchoolInfo} from "../../../../@core/models/school-info";
import {TranslateService} from "@ngx-translate/core";
import {Attendance} from "./attendance-report";
import {OptionalPdfSections} from "../olevel-report-forms/models/optional-pdf-sections";
import {YearSummaryReport} from "../../../../@core/models/evaluation/year-summary-report";
import {OlevelGrade} from "./olevel-grade";

export class ReportFormPdfBase {
	protected pdfDocument: PdfMakeWrapper;
	protected optionalSections: OptionalPdfSections;
	protected _schoolLogo!: string;
	protected _schoolInfo!: SchoolInfo;
	protected _studentImages: { [key: string]: string} ={};
	protected _orientation: "portrait" | "landscape" = "portrait";
	protected _signatures!: {
		principal: string;
		classTeacher: string;
		houseTeacher: string;
	};

	constructor(optionalSections: OptionalPdfSections, protected translate: TranslateService) {
		this.optionalSections = optionalSections;
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.pageMargins([8, 20, 8, 20]);
		this.pdfDocument.defaultStyle({
			font: "OpenSans",
		});
	}

	public set schoolInfo(schoolInfo: SchoolInfo) {
		this._schoolInfo = schoolInfo;
	}

	public set studentImages(images) {
		this._studentImages = images;
	}

	public set schoolLogo(logo) {
		this._schoolLogo = logo;
	}

	public set orientation(orientation: "portrait" | "landscape") {
		this._orientation = orientation;
	}

	public set signatures(signatures) {
		this._signatures = signatures;
	}

	protected getHeader(studentId, title = "") {
		return new Columns([
			{
				image: this._studentImages[studentId],
				width: 70,
				height: 70,
				alignment: "left",
				margin: [0, 0, 0, 5],
			},
			new Stack([
				new Txt(this._schoolInfo.name.toUpperCase()).margin([0, 0, 0, 5]).fontSize(18).end,
				new Txt(this._schoolInfo.address).fontSize(10).end,
				new Txt(this._schoolInfo.phone).fontSize(10).end,
				new Txt(this._schoolInfo.email).fontSize(10).end,
				new Txt(title || this.translate.instant("printouts.studentReport.assessmentReport").toUpperCase()).margin([0, 5, 0, 0]).fontSize(14).bold().end,
			]).alignment("center").bold().color("#172b4c").end,
			{
				image: this._schoolLogo,
				width: 70,
				height: 70,
				alignment: "right",
				margin: [0, 0, 0, 5],
			},
		]).end;
	}

	protected getLineSeparator() {
		const line = new Line(
			[0, 5],
			[(this._orientation == "portrait" ? 585 : 832), 5]
		).lineWidth(1.5).lineColor("#43ab49").end;
		return new Canvas([line]).end;
	}

	protected sectionHeader(header: string) {
		return new Txt(`${header.toUpperCase()}`)
			.fontSize(10)
			.color("#172b4c")
			.margin([0, 15, 0, 0])
			.bold()
			.end;
	}

	protected getStudentDetails(details: {studentName: string, studentAdmNo: string, streamName: string, term: string, year: string}, attendance: Attendance) {
		const studentNameAndAdmNo = [
			new Txt(`${this.translate.instant("printouts.studentReport.name")}: ${details.studentName}`)
				.margin([0, 0, 0, 5])
				.end,
			new Txt(`${this.translate.instant("printouts.studentReport.admNo")}: ${details.studentAdmNo}`)
				.margin([0, 0, 0, 5])
				.end,
		];

		const classAndTerm = [
			new Txt(`SENIOR ${details.streamName}`)
				.margin([0, 0, 0, 5])
				.end,
			new Txt(`${this.translate.instant("printouts.studentReport.term")}: ${details.term} ${details.year}`)
				.margin([0, 0, 0, 5])
				.end,
		];

		const attendanceReport = [
			new Txt("").width("*").end,
			new Table([
				[
					new Cell(
						new Txt(this.translate.instant("printouts.studentReport.attendanceReport")).fontSize(10).end,
					).colSpan(2).end,
					null,
				],
				[
					new Txt(this.translate.instant("printouts.studentReport.daysPresent")).fontSize(10).end,
					new Txt(`${attendance.presentDays ? attendance.presentDays:this.optionalSections.attendanceReport ? "0":"-"}`).fontSize(10).end,
				],
				[
					new Txt(this.translate.instant("printouts.studentReport.daysAbsent")).fontSize(10).end,
					new Txt(`${attendance.absentDays ? attendance.absentDays:this.optionalSections.attendanceReport ? "0":"-"}`).fontSize(10).end,
				],
				[
					new Txt(this.translate.instant("printouts.studentReport.total")).fontSize(10).end,
					new Txt(`${attendance.totalDays ? attendance.totalDays:this.optionalSections.attendanceReport ? "0":"-"}`).fontSize(10).end,
				],
			]).headerRows(1).bold().width("auto").widths([120, 40]).end
		];

		let studentDetails;

		if (this.optionalSections.attendanceReport) {
			studentDetails = new Columns([
				new Stack([
					...studentNameAndAdmNo,
					...classAndTerm,
				]).width("50%").fontSize(11).color("#172b4c").bold().alignment("left").end,
				new Columns([
					...attendanceReport
				]).width("50%").end
			]).end;
		}else {
			studentDetails = new Columns([
				new Stack([
					...studentNameAndAdmNo
				]).width("50%").fontSize(11).bold().alignment("left").end,
				new Stack([
					...classAndTerm
				]).width("50%").fontSize(11).bold().alignment("right").end
			]).color("#172b4c").end;
		}

		return new Stack([studentDetails]).margin([0, 5, 0, 0]).end;
	}

	protected getYearSummaryReportTable(yearSummary: YearSummaryReport[]) {
		return new Table([
			[
				new Txt(this.translate.instant("printouts.studentReport.subject").toUpperCase()).bold().end,
				new Txt(this.translate.instant("printouts.studentReport.yearSummary.formativeScore").toUpperCase()).bold().end,
				new Txt(this.translate.instant("printouts.studentReport.yearSummary.endOfYearBasedScore").toUpperCase()).bold().end,
				new Txt(this.translate.instant("printouts.studentReport.yearSummary.totalScore").toUpperCase()).bold().end,
				new Txt(this.translate.instant("common.grade")).bold().end,
			],
			...yearSummary.map((yearSummaryReport: YearSummaryReport) => {
				const formativeScore = yearSummaryReport.formativeScore ? yearSummaryReport.formativeScore.toString() : "";
				const endOfYearBasedScore = yearSummaryReport.endOfYearBasedScore ? yearSummaryReport.endOfYearBasedScore.toString() : "";
				const totalScore = yearSummaryReport.totalScore ? yearSummaryReport.totalScore.toString() : "";

				return [
					new Txt(yearSummaryReport.subjectName.toUpperCase()).bold().end,
					new Txt(formativeScore).bold().end,
					new Txt(endOfYearBasedScore).bold().end,
					new Txt(totalScore).bold().end,
					new Txt(yearSummaryReport.grade).bold().end,
				];
			})
		]).widths(["*", "20%", "20%", "20%", "10%"]).headerRows(1).fontSize(9).margin([0, 5, 0, 0]).end;
	}

	protected getGradeDescriptorTable(gradeDescriptors: OlevelGrade[]) {
		const columnWidths = this._orientation == "portrait" ? ["10%", "15%", "75%"] : ["10%", "10%", "80%"];
		return new Table([
			[
				new Txt(this.translate.instant("common.grade").toUpperCase()).alignment("center").end,
				new Txt(this.translate.instant("printouts.studentReport.yearSummary.scoreRange").toUpperCase()).alignment("center").end,
				new Txt(this.translate.instant("printouts.studentReport.yearSummary.gradeDescriptor").toUpperCase()).end,
			],
			...gradeDescriptors.map((gradeDescriptor: OlevelGrade) => {
				return [
					new Txt(gradeDescriptor.grade).alignment("center").end,
					new Txt(gradeDescriptor.range).alignment("center").end,
					new Txt(gradeDescriptor.description).end,
				];
			})
		]).widths(columnWidths).headerRows(1).bold().fontSize(9).margin([0, 5, 0, 0]).end;
	}

	protected classTeacherCommentAndSignature(classTeacherComment: string) {
		const signature = this.classTeacherSignature();

		const comment = this.classTeacherComment(classTeacherComment);

		return new Stack([
			new Columns([
				new Txt(`${this.translate.instant("printouts.studentReport.classTComment")}`)
					.alignment("left")
					.fontSize(10)
					.color("#172b4c")
					.bold()
					.end,
				new Columns([
					new Txt("").width("*").end,
					...signature,
				]).end,
			]).end,
			new Stack([
				comment,
			]).margin([0, 4, 0, 0]).end,
		]).margin([0, 10, 0, 0]).end;
	}

	private classTeacherSignature() {
		let signature: any[] = [null];
		let classTeacherSignature: IStack;

		if (this.optionalSections.classTeacherSignature && this._signatures.classTeacher) {
			classTeacherSignature = new Stack([
				{
					image: this._signatures.classTeacher,
					width: 55,
					height: 25,
					margin: [5, 0, 0, 0]
				},
				new Canvas([new Line([0, 4], [100, 4]).lineWidth(1.5).dash(2).end]).alignment("left").margin([4, 0, 0, 0]).end,
			]).end;
		} else {
			classTeacherSignature = new Stack([
				new Txt("").end,
				new Canvas([new Line([0, 6], [100, 6]).lineWidth(1.5).dash(2).end]).alignment("left").margin([4, 6, 0, 0]).end,
			]).end;
		}

		signature = [
			new Txt(`${this.translate.instant("printouts.studentReport.signature")}`).alignment("right").fontSize(10).end,
			new Stack([
				classTeacherSignature,
			]).alignment("left").width("auto").end,
		];
		return signature;
	}

	private classTeacherComment(classTeacherComment) {
		const point2X = this._orientation === "portrait" ? 587 : 830;
		if (this.optionalSections.classTeacherComments && classTeacherComment) {
			return new Stack([
				new Txt(`${classTeacherComment}`).fontSize(9).bold().end,
				new Canvas([new Line([0, 4], [point2X, 4]).lineWidth(1.5).dash(2).end]).end,
			]).end;
		} else {
			return new Stack([
				new Txt("").end,
				new Canvas([new Line([0, 4], [point2X, 4]).lineWidth(1.5).dash(2).end]).margin([0, 5, 0, 0]).end,
			]).end;
		}
	}

	protected getHouseTeacherCommentAndSignature(houseTeacherComment) {
		const signature = this.houseTeacherSignature();

		const comment = this.houseTeacherComment(houseTeacherComment);

		return new Stack([
			new Columns([
				new Txt(`${this.translate.instant("printouts.studentReport.houseTComment")}`)
					.alignment("left")
					.fontSize(10)
					.color("#172b4c")
					.bold()
					.end,
				new Columns([
					new Txt("").width("*").end,
					...signature,
				]).end,
			]).end,
			new Stack([
				comment,
			]).margin([0, 4, 0, 0]).end,
		]).margin([0, 10, 0, 0]).end;
	}

	private houseTeacherSignature() {
		let signature: any[] = [null];
		let houseTeacherSignature: IStack;

		if (this.optionalSections.houseTeacherSignature && this._signatures.houseTeacher) {
			houseTeacherSignature = new Stack([
				{
					image: this._signatures.houseTeacher,
					width: 55,
					height: 25,
					margin: [5, 0, 0, 0]
				},
				new Canvas([new Line([0, 4], [100, 4]).lineWidth(1.5).dash(2).end])
					.alignment("left")
					.margin([4, 0, 0, 0]).end
			]).end;
		} else {
			houseTeacherSignature = new Stack([
				new Txt("").end,
				new Canvas([new Line([0, 6], [100, 6]).lineWidth(1.5).dash(2).end])
					.alignment("left")
					.margin([4, 6, 0, 0]).end
			]).end;
		}

		signature = [
			new Txt(`${this.translate.instant("printouts.studentReport.signature")}`).alignment("right").fontSize(10).end,
			new Stack([
				houseTeacherSignature,
			]).alignment("left").width("auto").end,
		];
		return signature;
	}

	private houseTeacherComment(houseTeacherComment: string) {
		const point2X = this._orientation === "portrait" ? 587 : 830;
		if (this.optionalSections.houseTeacherComments && houseTeacherComment) {
			return new Stack([
				new Txt(`${houseTeacherComment}`).fontSize(9).bold().end,
				new Canvas([new Line([0, 4], [point2X, 4]).lineWidth(1.5).dash(2).end]).end,
			]).end;
		} else {
			return new Stack([
				new Txt("").fontSize(10).end,
				new Canvas([new Line([0, 4], [point2X, 4]).lineWidth(1.5).dash(2).end]).margin([0, 5, 0, 0]).end,
			]).end;
		}
	}

	protected getPrincipalCommentAndSignature(principalComment: string) {
		const signature = this.principalSignature();

		const comment = this.principalComment(principalComment);

		return new Stack([
			new Columns([
				new Txt(`${this.translate.instant("printouts.studentReport.headTComment")}`)
					.alignment("left")
					.fontSize(10)
					.color("#172b4c")
					.bold()
					.end,
				new Columns([
					new Txt("").width("*").end,
					...signature,
				]).end,
			]).end,
			new Stack([
				comment,
			]).margin([0, 4, 0, 0]).end,
		]).margin([0, 10, 0, 0]).end;
	}

	private principalSignature() {
		let signature: any[] = [null];
		let principalSignature: IStack;

		if (this.optionalSections.principalSignature && this._signatures.principal) {
			principalSignature = new Stack([
				{
					image: this._signatures.principal,
					width: 55,
					height: 25,
					margin: [5, 0, 0, 0]
				},
				new Canvas([new Line([0, 4], [100, 4]).lineWidth(1.5).dash(2).end]).alignment("left").margin([4, 0, 0, 0]).end,
			]).end;
		} else {
			principalSignature = new Stack([
				new Txt("").end,
				new Canvas([new Line([0, 6], [100, 6]).lineWidth(1.5).dash(2).end]).alignment("left").margin([4, 10, 0, 0]).end,
			]).end;
		}

		signature = [
			new Txt(`${this.translate.instant("printouts.studentReport.signature")}`).alignment("right").fontSize(10).end,
			new Stack([
				principalSignature,
			]).alignment("left").width("auto").end,
		];
		return signature;
	}

	private principalComment(principalComment: string) {
		const point2X = this._orientation === "portrait" ? 587 : 830;
		if (this.optionalSections.principalComments && principalComment) {
			return new Stack([
				new Txt(`${principalComment}`).fontSize(9).bold().end,
				new Canvas([new Line([0, 4], [point2X, 4]).lineWidth(1.5).dash(2).end]).end,
			]).end;
		} else {
			return new Stack([
				new Txt("").fontSize(10).end,
				new Canvas([new Line([0, 4], [point2X, 4]).lineWidth(1.5).dash(2).end]).margin([0, 5, 0, 0]).end,
			]).end;
		}
	}

	protected pageBreak() {
		return new Txt("").pageBreak("before").end;
	}
}
