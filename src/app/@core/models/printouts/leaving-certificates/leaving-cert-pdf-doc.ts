import { Canvas, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt } from "pdfmake-wrapper";
import * as pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake

export class LeavingCertPdfDoc {
	protected readonly pdfDocument!: PdfMakeWrapper;
	private schoolCert: any;
	private coa: string;
	private schoolTitle: string;
	private intakeLabel: string;
	private schoolLogo: string;
	private pageSize: string;
	private currentDate: string;
	constructor(
		schoolCert: any,
		coa: string,
		schoolTitle: string,
		intakeLabel: string,
		schoolLogo: string,
		currentDate: string,
		pageSize = "A4"
	) {
		this.schoolCert = schoolCert,
		this.coa = coa,
		this.schoolTitle = schoolTitle,
		this.intakeLabel = intakeLabel,
		this.schoolLogo = schoolLogo,
		this.currentDate = currentDate;
		this.pageSize = pageSize;

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.pageOrientation("portrait");
		this.pdfDocument.defaultStyle({
			fontSize: 10
		});
		this.pdfDocument.pageSize(pageSize);
	}

	public async build() {
		this.pdfDocument.add(await this.getImageHeader());
		this.pdfDocument.add(this.getLetterHead());
		this.pdfDocument.add(this.getTitle());
		this.pdfDocument.add(this.getBody());

		return this.pdfDocument;
	}

	private async getImageHeader() {
		const coatOfArms = await new Img(this.coa).fit([65, 65]).alignment("left").build();
		const schoolLogo = await new Img(`${this.schoolLogo}?cacheblock=true`).fit([65, 65]).alignment("right").build();

		return new Columns([
			coatOfArms,
			schoolLogo
		]).end;
	}

	private getLetterHead() {

		const noteTo = new Stack([
			new Txt("REPUBLIC OF KENYA").alignment("left").end,
			new Txt("MINISTRY OF EDUCATION").alignment("left").end
		]).end;

		const date = new Stack([
			new Txt(this.schoolCert?.school?.name.toString().toUpperCase() || "").alignment("right").end,
			new Txt(this.schoolCert?.school?.address.toString().toUpperCase() || "").alignment("right").end
		]).end;


		return new Columns([
			[noteTo],
			[date]
		]).end;
	}

	private getTitle() {
		const title = new Txt(`${this.schoolTitle?.toUpperCase() || ""} SCHOOL LEAVING CERTIFICATE`).fontSize(16).decoration("underline").bold().alignment("center").margin([0, 20, 0, 20]).end;
		const adminOrUpi = new Columns([
			new Txt(`Admission/Serial No. ${this.schoolCert?.student?.admissionNumber}`).bold().alignment("left").end,
			new Txt(`UPI No.  ${this.schoolCert?.student?.upiNumber? this.schoolCert?.student?.upiNumber.toString().toUpperCase(): "N/A"}`).bold().alignment("right").end
		]).end;

		const adminLine = new Canvas([
			new Line([90, 1], [150, 1]).dash(1).end
		]).end;

		const upiLine = new Canvas([
			new Line([490, 1], [520, 1]).dash(1).end
		]).end;

		return new Stack([
			[title],
			[adminOrUpi, adminLine, upiLine]
		]).margin([0, 0, 0, 20]).end;
	}

	private getBody() {

		const line1 = new Table([
			[
				new Txt("This is to certify that").alignment("left").end,
				new Txt("").end,
				new Txt(`${this.schoolCert?.student?.name? this.schoolCert?.student?.name?.toString().toUpperCase(): ""}`).bold().alignment("left").end,
			]
		]).layout("noBorders").end;

		const nameLine = new Canvas([
			new Line([100, 1], [510, 1]).dash(1).end
		]).end;


		const line2 = new Table([
			[
				new Txt("Entered this school on ").alignment("left").end,
				new Txt("").end,
				new Txt(`${this.schoolCert.student.admissionDate}`).bold().alignment("left").end,
				new Txt("").end,
				new Txt(`and was enrolled in ${this.intakeLabel.toLowerCase()}`).alignment("left").end,
				new Txt("").end,
				new Txt(`${this.schoolCert.student.enrollmentForm.toString().toUpperCase()}`).bold().alignment("center").end,
				new Txt("").end,
				new Txt("and left in").fontSize(10).alignment("left").end,
				new Txt(`${this.schoolCert.student.graduationDate.toString().toUpperCase()}`).bold().alignment("left").end,
			],
		]).layout("noBorders").margin([0,10,0,0]).end;

		const admissionDateLine = new Canvas([
			new Line([100, 1], [180, 1]).dash(1).end
		]).end;

		const enrollmentFormLine = new Canvas([
			new Line([300, 1], [330, 1]).dash(1).end
		]).end;

		const graduationDateLine = new Canvas([
			new Line([380, 1], [510, 1]).dash(1).end
		]).end;


		const line3 = new Table([
			[
				new Txt(`from ${this.intakeLabel.toLowerCase()}`).alignment("left").end,
				new Txt("").end,
				new Txt(`${this.schoolCert.student.graduationForm.toString().toUpperCase()}`).bold().alignment("center").end,
				new Txt("").end,
				new Txt(`having satisfactory completed the approved course for ${this.intakeLabel.toLowerCase()}`).alignment("left").end,
				new Txt("").end,
				new Txt(`${this.schoolCert.student.graduationForm.toString().toUpperCase()}`).bold().alignment("center").end,
			],
		]).layout("noBorders").margin([0,10,0,0]).end;

		const intakeLabelLine = new Canvas([
			new Line([50, 1], [85, 1]).dash(1).end
		]).end;

		const graduationFormLine = new Canvas([
			new Line([360, 1], [510, 1]).dash(1).end
		]).end;

		const line4 = new Table([
			[
				new Txt("Date Of Birth").alignment("left").end,
				new Txt("(In Admission Register)").italics().alignment("left").end,
				new Txt("").end,
				new Txt("").end,
				new Txt(`${this.schoolCert.student.dateOfBirth.toString().toUpperCase()}`).bold().alignment("center").end,
				new Txt("").end,
				new Txt("").end
			],
		]).layout("noBorders").margin([0,20,0,0]).end;

		const dobLine = new Canvas([
			new Line([180, 1], [300, 1]).dash(1).end
		]).end;

		const line5 = new Table([
			[
				new Txt(`${this.schoolCert?.school?.principal?.title}’s report on the pupil’s ability, industry and conduct`).alignment("left").end,
			],
		]).layout("noBorders").margin([0,10,0,0]).end;


		const descriptionArray: Array<any> = [];

		this.schoolCert?.parts?.forEach((desc: any) => {
			const studentDescription = new Table([
				[
					new Txt(`${desc}`).bold().alignment("left").end,
				],
			]).layout("noBorders").margin([0,10,0,0]).end;

			const studentDescriptionLine = new Canvas([
				new Line([0, 1], [510, 1]).dash(1).end
			]).end;

			const descriptionStack = new Columns([
				[studentDescription, studentDescriptionLine]
			]).end;

			descriptionArray.push(descriptionStack);
		});

		const line6 = new Table([
			[
				new Txt("Student Signature:").alignment("left").end,
				new Txt(`Date Of Issue:  ${this.currentDate || ""}`).margin([200,0,0,0]).alignment("right").end,
			],
		]).layout({
			hLineWidth: (i) => {
				return 0;
			},
			vLineWidth: function () {
				return 0;
			},
			paddingLeft: function () {
				return 20;
			},
			paddingRight: function () {
				return 20;
			},
		}).margin([0,30,0,0]).end;

		const studentSignatureLine = new Canvas([
			new Line([100, 1], [210, 1]).dash(1).end
		]).end;

		const issueDateLine = new Canvas([
			new Line([405, 1], [500, 1]).dash(1).end
		]).end;


		const signatureLine = new Columns([
			[new Txt("Signature: ..................................").alignment("center").end],
		]).margin([0,60,0,0]).end;

		const principalName = new Columns([
			[new Txt(this.schoolCert?.school?.principal?.name?.toString().toUpperCase()).bold().alignment("center").end],
		]).margin([0,15,0,0]).end;

		const principalTitle = new Columns([
			[new Txt((this.schoolCert?.school?.principal?.title?.toString().toUpperCase()) || "").bold().alignment("center").end],
		]).end;

		const footer = new Columns([
			[new Txt("This certificate was issued without any erasure or alteration whatsoever").bold().alignment("center").end],
		]).margin([0,120,0,5]).end;


		return new Stack([
			[line1, nameLine],
			[line2, admissionDateLine, enrollmentFormLine, graduationDateLine],
			[line3, intakeLabelLine, graduationFormLine],
			[line4, dobLine],
			[line5],
			[descriptionArray],
			[line6, studentSignatureLine, issueDateLine],
			[signatureLine],
			[principalName],
			[principalTitle],
			[footer]
		]).end;
	}
}
