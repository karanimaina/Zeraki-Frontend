import {Cell, Columns, Img, PdfMakeWrapper, Stack, Table, Txt} from "pdfmake-wrapper";
import * as pdfFonts from "pdfmake/build/vfs_fonts.js";
import {TranslateService} from "@ngx-translate/core";
import {AppInjector} from "src/app/app.module";
import {SchoolInfo} from "../../school-info";
import { SchoolTypeData } from "../../school-type-data";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";

export class TranscriptPdfDoc {

	private readonly pdfDocument: PdfMakeWrapper;
	private schoolProfile: SchoolInfo;
	private schoolLogo: string;
	private readonly transcriptContent: any;
	private readonly showMarksOrPoints: boolean;
	private readonly showStudentRank: boolean;
	private readonly showGradeDescription: boolean;
	private readonly avatarUrl: string;
	private readonly schoolTypeData?: SchoolTypeData;
	translate = AppInjector.get(TranslateService);

	constructor(
		schoolProfile: SchoolInfo,
		schoolLogo: string,
		transcriptContent: any,
		showMarksOrPoints = true,
		showStudentRank = true,
		showGradeDescription = true,
		avatarUrl: string,
		schoolTypeData?: SchoolTypeData,
	) {
		this.schoolProfile = schoolProfile;
		this.schoolLogo = schoolLogo;
		this.transcriptContent = transcriptContent;
		this.showMarksOrPoints = showMarksOrPoints;
		this.showStudentRank = showStudentRank;
		this.showGradeDescription = showGradeDescription;
		this.avatarUrl = avatarUrl;
		this.schoolTypeData = schoolTypeData;

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.pageMargins([28, 20]);
		this.pdfDocument.defaultStyle({
			fontSize: 10
		});
		this.pdfDocument.compress(true);
	}

	private get isSouthAfricanSchool(): boolean {
		return (
			this.schoolTypeData?.isSouthAfricaPrimarySchool ||
			this.schoolTypeData?.isSouthAfricaSecondarySchool ||
			false
		);
	}

	private async getDocumentHeader(studentData) {
		let schoolLogoImageLoaded = false;
		let schoolLogoImage;

		if (this.schoolLogo) {
			try {
				schoolLogoImage = await new Img(`${this.schoolLogo}?cacheblock=true`).fit([65, 65]).build();
				schoolLogoImageLoaded = true;
			} catch (e) {
				schoolLogoImageLoaded = false;
			}
		}

		const schoolName = new Txt(this.schoolProfile?.name)
			.fontSize(14)
			.bold()
			.alignment("center")
			.end;

		const documentTitle = new Txt(this.translate.instant("printouts.transcripts.academicTranscript"))
			.bold()
			.fontSize(12)
			.margin([0, 7, 0, 0])
			.alignment("center")
			.end;

		const schoolAddress = new Txt(this.schoolProfile?.address || "").bold().margin([0, 5, 0, 0]).end;
		const schoolPhone = new Txt(this.schoolProfile?.phone || "").bold().margin([0, 5, 0, 0]).end;
		const schoolEmail = new Txt(this.schoolProfile?.email || "").bold().margin([0, 5, 0, 0]).end;

		const schoolAddressAndLogoSection = new Stack([
			(schoolLogoImageLoaded) ? schoolLogoImage : "",
			schoolAddress,
			schoolPhone,
			schoolEmail
		]).alignment("right").end;

		return new Columns([
			await this.getStudentHeaderSection(studentData),
			new Stack([
				schoolName,
				documentTitle
			]).end,
			schoolAddressAndLogoSection
		]).margin([0, 0, 0, 10]).end;

	}

	private async getStudentHeaderSection(studentData) {
		let studentImageLoaded = false;
		let studentImage;
		if (studentData?.url) {
			try {
				studentImage = await new Img(`${studentData?.url}?cacheblock=true`).fit([65, 65]).build();
				studentImageLoaded = true;
			} catch (e) {
				try {
					studentImage = await new Img(this.avatarUrl).fit([65, 65]).build();
					studentImageLoaded = true;
				} catch (e) {
					studentImageLoaded = false;
				}

			}
		} else {
			try {
				studentImage = await new Img(this.avatarUrl).fit([65, 65]).build();
				studentImageLoaded = true;
			} catch (e) {
				studentImageLoaded = false;
			}
		}

		const studentName = new Txt([
			new Txt(this.translate.instant("printouts.transcripts.name") + " : ").end,
			new Txt(studentData?.name || "").end
		]).bold().margin([0, 5, 0, 0]).end;
		const studentAdmissionNumber = new Txt([
			new Txt(this.translate.instant("printouts.transcripts.admNo") + " : ").end,
			new Txt(studentData?.admno || "").end
		]).bold().margin([0, 5, 0, 0]).end;
		const studentForm = new Txt([
			new Txt(`${this.translate.instant("printouts.transcripts.current")}`).end,
			new Txt(`${(studentData?.formOrYear? studentData?.formOrYear.toString().toUpperCase() : "")} :`).end,
			new Txt(`${(studentData?.currentClass || "")}`).end
		]).bold().margin([0, 5, 0, 0]).end;
		const studentUpi = new Txt([
			new Txt(`${this.upiTranslation} :`).end,
			new Txt(`${(studentData?.upi || "")}`).end
		]).bold().margin([0, 5, 0, 0]).end;
		const studentKCPEScore = new Txt([
			new Txt(`${this.translate.instant("printouts.transcripts.kcpe")}:`).end,
			new Txt(`${(studentData?.kcpe_score || "")}`).end
		]).bold().margin([0, 5, 0, 0]).end;

		return new Stack([
			(studentImageLoaded) ? studentImage : "",
			studentName,
			studentAdmissionNumber,
			studentForm,
			(studentData?.upi) ? studentUpi : "",
			(studentData?.kcpe_score) ? studentKCPEScore : ""
		]).alignment("left").bold().end;

	}


	private async getStudentTableSection(studentData) {

		const formsTitleSection: any = [new Cell(new Txt(this.translate.instant("printouts.transcripts.subject")).end).bold().margin([0, 15, 0, 3]).rowSpan(2).end];
		const termsTitleSection: any = [""];
		const tableWidths: any[] = [];

		studentData?.forms?.forEach((form) => {
			if (form?.terms > 1) {
				formsTitleSection.push(new Cell(new Txt(form.name).end).colSpan(form?.terms).bold().alignment("center").end);
				for (let i = 0; i < form.terms - 1; i++) {
					formsTitleSection.push(null);
				}
			} else {
				formsTitleSection.push(new Cell(new Txt(form.name).end).bold().alignment("center").end);

			}
		});
		studentData?.terms?.forEach((term) => {
			termsTitleSection.push(new Txt(term.name).margin([5, 0]).alignment("center").bold().end);
		});

		termsTitleSection.forEach((t, i) => {
			i == 0 ?
				tableWidths.push("*") :
				tableWidths.push("auto");
		});


		const subjectInfo: any = [];
		studentData?.subjects?.forEach((subject) => {
			let record: any[] = [];
			const subjectName = subject.name;
			record.push(
				new Txt(subjectName).height(9).end
			);
			studentData?.terms?.forEach((term) => {
				const grade = studentData?.results[term.key]["subjectData"][subject.name]?.grade || "-";
				const marks = studentData?.results[term.key]["subjectData"][subject.name]?.marks || "-";


				const column = (grade == "-" && marks == "-") ?
					new Txt("-").alignment("center").end
					: (this.showMarksOrPoints) ? new Columns([
						new Txt(marks).alignment("left").end,
						new Txt(grade).alignment("right").end,
					]).margin([5, 0]).end : new Columns([
						new Txt(grade).alignment("center").end,
					]).end;


				record.push(
					column
				);
			});
			subjectInfo.push(record);
			record = [];
		});

		const meanMarksTxt = this.translate.instant(this.isSouthAfricanSchool ? "printouts.transcripts.average" : "printouts.transcripts.mean");
		const totalMarksTxt = this.translate.instant("printouts.transcripts.total");
		const totalPointsTxt = this.translate.instant("printouts.transcripts.totalPoints");
		const overallRankTxt = this.translate.instant("printouts.transcripts.overallRank");
		const overallGradeTxt = this.translate.instant("printouts.transcripts.overallGrade");
		const analysisHeaders = [
			meanMarksTxt,
			totalMarksTxt,
			totalPointsTxt,
			overallRankTxt,
			overallGradeTxt,
		];

		analysisHeaders.forEach((header) => {
			let record: any[] = [];
			if (this.showMarksOrPoints && header == meanMarksTxt) record.push(new Txt(header.toUpperCase()).end);
			if (this.showMarksOrPoints && header == totalMarksTxt) record.push(new Txt(header.toUpperCase()).end);
			if (this.showMarksOrPoints && header == totalPointsTxt) record.push(new Txt(header.toUpperCase()).end);
			if (this.showStudentRank && header == overallRankTxt) record.push(new Txt(header.toUpperCase()).end);
			if (header == overallGradeTxt) record.push(new Txt(header.toUpperCase()).end);

			studentData?.terms?.forEach((term) => {
				const data = studentData?.results[term.key];
				const meanMarks = new Txt(data["avg"] + ".00%").alignment("center").end;
				const totalMarks = new Txt(data["total_marks"] + " / " + data["total_marks_outof"]).alignment("center").end;
				const totalPoints = new Txt(data["total_points"] + " / " + data["total_points_outof"]).alignment("center").end;
				const overallRank = new Txt(data["classRank"] + " / " + data["classRankTotal"]).alignment("center").end;
				const overallGrade = new Txt(data["meanGrade"]).alignment("center").end;
				if (this.showMarksOrPoints && header == meanMarksTxt) record.push(meanMarks);
				if (this.showMarksOrPoints && header == totalMarksTxt) record.push(totalMarks);
				if (this.showMarksOrPoints && header == totalPointsTxt) record.push(totalPoints);
				if (this.showStudentRank && header == overallRankTxt) record.push(overallRank);
				(header == overallGradeTxt) ? record.push(overallGrade) : "";
			});

			if (record.length > 0) subjectInfo.push(record);
			record = [];
		});

		const dataRow = [
			formsTitleSection,
			termsTitleSection,
			...subjectInfo
		];

		const subjectTableHeader = new Table(dataRow)
			.widths(tableWidths)
			.fontSize(10)
			.end;

		return subjectTableHeader;
	}

	private async getGradeSection() {
		return (this.showGradeDescription) ? new Stack([
			new Txt(this.translate.instant("printouts.transcripts.grades.title")).bold().fontSize(12).end,
			new Columns([
				new Txt(this.translate.instant("printouts.transcripts.grades.a")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.b")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.c")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.d")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.e")).bold().end,
			]).end,
			new Columns([
				new Txt(this.translate.instant("printouts.transcripts.grades.a_")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.b_")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.c_")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.d_")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.x")).bold().end,
			]).margin([0, 10]).end,
			new Columns([
				"",
				new Txt(this.translate.instant("printouts.transcripts.grades.b__")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.c__")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.d__")).bold().end,
				new Txt(this.translate.instant("printouts.transcripts.grades.y")).bold().end,
			]).end,
		])
			.margin([0, 10, 0, 0])
			.end : "";
	}

	private async getHodAndPrincipalSection() {

		let dosSignatureLoaded = false;
		let dosSignature;

		if (this.schoolProfile?.dos?.signature) {
			try {
				dosSignature = await new Img(`${this.schoolProfile?.dos?.signature}?cacheblock=true`).fit([65, 65]).build();
				dosSignatureLoaded = true;
			} catch (e) {
				dosSignatureLoaded = false;
			}
		}

		let principalSignatureLoaded = false;
		let principalSignature;

		if (this.schoolProfile?.principal?.signature) {
			try {
				principalSignature = await new Img(`${this.schoolProfile?.principal?.signature}?cacheblock=true`).fit([65, 65]).build();
				principalSignatureLoaded = true;
			} catch (e) {
				principalSignatureLoaded = false;
			}
		}

		const content = new Stack([
			new Table([
				[
					new Txt(this.schoolProfile?.dos? this.translate.instant("printouts.transcripts.hod"): "").bold().end,
					new Txt("" + (this.schoolProfile?.principal?.title || "")).bold().end,
				],
				[
					dosSignatureLoaded ? dosSignature:new Txt("").end,
					principalSignatureLoaded ? principalSignature:new Txt("").end
				],
				[
					new Txt(this.schoolProfile?.dos?.name || "").end,
					new Txt(this.schoolProfile?.principal?.name || "").end
				],
				// [new Cell(new Txt("This is some comment sections").end).end, null],
				[new Cell(new Txt("").end).end,null],
			]).layout("noBorders").margin([0, 10]).widths(["*", "*"]).end

		]).end;

		return new Stack([content]).pageBreak("after").end;
	}

	get upiTranslation(): string {
		const upiTranslation = BasicUtils.upiTranslation(this.schoolTypeData);

		return upiTranslation;
	}


	public async build() {
		/**
		 * This is to ensure single student data is catered for
		 */
		const arrayOfStudents: Array<any> = Array.isArray(this.transcriptContent) ? this.transcriptContent: [this.transcriptContent];


		for (const studentData of arrayOfStudents) {
			this.pdfDocument.add(await this.getDocumentHeader(studentData));
			this.pdfDocument.add(await this.getStudentTableSection(studentData));
			this.pdfDocument.add(await this.getGradeSection());
			this.pdfDocument.add(await this.getHodAndPrincipalSection());
		}
		return this.pdfDocument;
	}


}
