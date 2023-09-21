import {PdfDocument} from "./pdf-document";

export class StudentsPdfReport {
	private pdfDocument: PdfDocument;

	constructor(title: string, content: any[]) {
		this.pdfDocument = new PdfDocument();
		this.pdfDocument.setTitle(title);
		this.pdfDocument.setContent(content);
		this.pdfDocument.setStyles(this.styles);
		this.pdfDocument.setPageMargins(this.pageMargins);
		this.pdfDocument.setDefaultStyle({
			font: "OpenSans"
		});
	}

	private get styles() {
		return {
			header: {
				fontSize: 15,
				bold: true
			},
			subheader: {
				fontSize: 10,
				bold: true,
				margin: [0, 2, 0, 0]
			},
			textBold: {
				fontSize: 8,
				bold: true
			},
			text: {
				alignment: "justify",
				fontSize: 8
			},
			reportFormTitle: {
				fontSize: 11,
				bold: true,
				margin: [0, 5, 0, 5]
			},
			studentDetails: {
				fontSize: 9,
				bold: true,
				margin: [0, 1, 0, 1]
			},
			scoreSummaryHeader: {
				fontSize: 8,
				bold: true,
				margin: [0, 2, 0, 2]
			},
			scoreSummaryValue: {
				fontSize: 12,
				bold: true,
				margin: [0, 0, 0, 2],
				color: "#2ea5de"
			},
			scoreSummaryValueDark: {
				fontSize: 12,
				bold: true,
				margin: [0, 0, 0, 2]
			},
			deviation: {
				fontSize: 9,
				bold: true,
				margin: [0, 2]
			},
			studentVsClassLabel: {
				fontSize: 8,
				bold: true,
				alignment: "center"
			},
			mt2: {
				margin: [0, 2, 0, 0]
			},
			mt3: {
				margin: [0, 3, 0, 0]
			},
			mt4: {
				margin: [0, 3, 0, 0]
			},
			tableHeader: {
				fontSize: 8,
				bold: true
			},
			tableData: {
				fontSize: 7,
				bold: true
			},
			reportExtras: {
				fontSize: 7,
				bold: true
			},

		};
	}

	private get pageMargins() {
		return [10, 10, 10, 10];
	}

	public getStudentPdfReport() {
		return this.pdfDocument;
	}
}
