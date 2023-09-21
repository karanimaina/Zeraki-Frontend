import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {OlevelTranscript} from "../../models/olevel-transcript";
import {Observable, of} from "rxjs";
import {SchoolInfo} from "../../../../../../@core/models/school-info";
import {DataService} from "../../../../../../@core/shared/services/data/data.service";
import {SchoolService} from "../../../../../../@core/shared/services/school/school.service";
import {TranslateService} from "@ngx-translate/core";
import {OlevelTranscriptPdf} from "../../models/olevel-transcript-pdf";
import {OptionalPdfSections} from "../../../olevel-report-forms/models/optional-pdf-sections";
import {
	ExtractImagesFromDomComponent
} from "../../../olevel-report-forms/components/extract-images-from-dom/extract-images-from-dom.component";
import {ReportFormService} from "../../../../../../@core/services/printouts/report-forms/report-form.service";
import {catchError, finalize} from "rxjs/operators";
import {
	ResponseHandlerService
} from "../../../../../../@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-student-transcript",
	templateUrl: "./student-transcript.component.html",
	styleUrls: ["./student-transcript.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentTranscriptComponent extends ExtractImagesFromDomComponent implements OnInit {
	@Input() olevelTranscript!: OlevelTranscript;

	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	formOrYear!: string ;
	selectedOptions!: OptionalPdfSections;
	downloadingReport = false;
	constructor(
		private schoolService: SchoolService,
		private dataService: DataService,
		private translate: TranslateService,
		private reportFormsService: ReportFormService,
		private responseHandler: ResponseHandlerService,
		private cdr: ChangeDetectorRef) {
		super();
	}

	ngOnInit(): void {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.formOrYear = schoolTypeData.formoryear;
		});
	}

	get pdfTitleForStudent(): string {
		return this.olevelTranscript.transcripts.length == 1
			? this.olevelTranscript.transcripts[0].studentDetails.studentName
			:"";
	}

	get pdfTitle(): string {
		const summaryTitle = this.translate.instant("printouts.studentReport.yearSummary.yearSummaryReport");
		return this.pdfTitleForStudent
			? this.pdfTitleForStudent+" "+summaryTitle
			: this.formOrYear + " "+this.olevelTranscript.streamName+ " " + summaryTitle;
	}

	updateSelectedOptions(selectedOptions) {
		this.selectedOptions = selectedOptions;
	}

	downloadTranscripts(schoolInfo: SchoolInfo) {
		const pdfDocument = new OlevelTranscriptPdf(
			this.selectedOptions,
			this.translate,
			this.olevelTranscript,
		);
		pdfDocument.schoolInfo = schoolInfo;
		pdfDocument.studentImages = this.studentImagesInBase64;
		pdfDocument.schoolLogo = this.schoolLogoInBase64;
		pdfDocument.signatures = this.signaturesInBase64;

		const docDefinition = pdfDocument.buildPdfDocument().getDefinition();

		this.downloadingReport = true;
		this.reportFormsService.downloadReportAsPdf$(docDefinition, this.pdfTitle)
			.pipe(
				catchError((error) => {
					error["message"] = this.translate.instant("printouts.meritList.toastMessages.generatePdfError", {title: this.pdfTitle+".pdf"});
					this.responseHandler.error(error, "downloadTranscripts()");
					return of(null!);
				}),
				finalize(() => {
					this.downloadingReport = false;
					this.cdr.detectChanges();
				}))
			.subscribe();

	}

	get studentImagesInBase64() {
		const studentIds = this.olevelTranscript.transcripts.map(studentTranscript => studentTranscript.studentDetails.studentId);
		return this.getStudentImagesInBase64(studentIds);
	}
}
