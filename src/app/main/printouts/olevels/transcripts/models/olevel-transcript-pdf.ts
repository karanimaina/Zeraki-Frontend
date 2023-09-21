import {ReportFormPdfBase} from "../../models/report-form-pdf-base";
import {OptionalPdfSections} from "../../olevel-report-forms/models/optional-pdf-sections";
import {TranslateService} from "@ngx-translate/core";
import {OlevelTranscript} from "./olevel-transcript";

export class OlevelTranscriptPdf extends ReportFormPdfBase {
	private title: string = this.translate.instant("printouts.studentReport.yearSummary.yearSummaryReport").toUpperCase();
	constructor(optionalSections: OptionalPdfSections, protected translate: TranslateService, private transcriptReport: OlevelTranscript) {
		super(optionalSections, translate);

		this.pdfDocument.info({
			title: this.title,
		});
	}

	public buildPdfDocument() {
		this.transcriptReport.transcripts.forEach((transcript, index) => {
			this.pdfDocument.add(this.getHeader(transcript.studentDetails.studentId, this.title));
			this.pdfDocument.add(this.getLineSeparator());

			const studentDetails = {
				studentName: transcript.studentDetails.studentName,
				studentAdmNo: transcript.studentDetails.studentAdmNo,
				streamName:  this.transcriptReport.streamName,
				year: this.transcriptReport.year,
				term: this.transcriptReport.term
			};

			this.pdfDocument.add(this.getStudentDetails(studentDetails, transcript.studentDetails.attendance));

			this.pdfDocument.add(this.getYearSummaryReportTable(transcript.yearSummary));
			this.pdfDocument.add(this.classTeacherCommentAndSignature(transcript.classTeacherComments));

			if (this.optionalSections.houseTeacherComments) {
				this.pdfDocument.add(this.getHouseTeacherCommentAndSignature(transcript.houseTeacherComments));
			}

			this.pdfDocument.add(this.getPrincipalCommentAndSignature(transcript.principalComments));

			if (this.optionalSections.gradeDescriptor) {
				this.pdfDocument.add(this.sectionHeader(this.translate.instant("printouts.studentReport.yearSummary.gradeDescriptors")));
				this.pdfDocument.add(this.getGradeDescriptorTable(this.transcriptReport.grades));
			}

			if(index !== this.transcriptReport.transcripts.length - 1) {
				this.pdfDocument.add(this.pageBreak());
			}
		});

		return this.pdfDocument;
	}
}
