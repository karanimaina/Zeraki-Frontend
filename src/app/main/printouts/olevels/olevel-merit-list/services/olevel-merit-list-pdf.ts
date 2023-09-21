import {Cell, Columns, PdfMakeWrapper, Stack, Table, Txt} from "pdfmake-wrapper";
import {TranslateService} from "@ngx-translate/core";
import {SchoolService} from "../../../../../@core/shared/services/school/school.service";
import {Injectable} from "@angular/core";
import {SchoolInfo} from "../../../../../@core/models/school-info";
import {distinctUntilChanged, filter, take} from "rxjs/operators";
import {combineLatest, Observable} from "rxjs";
import {ReportFormService} from "../../../../../@core/services/printouts/report-forms/report-form.service";
import {DataService} from "../../../../../@core/shared/services/data/data.service";
import {SchoolTypeData} from "../../../../../@core/models/school-type-data";
import {PdfParams} from "../models/pdf-params";

@Injectable()
export class OlevelMeritListPdf {
	private pdfDocument!: PdfMakeWrapper;
	private schoolInfo!: SchoolInfo;
	private schoolTypeData!: SchoolTypeData;
	private pdfParams!: PdfParams;

	constructor(
		private schoolService: SchoolService,
		private translate: TranslateService,
		private reportFormService: ReportFormService,
		private dataService: DataService) {
	}

	public generatePdf(pdfParams: PdfParams): Observable<any> {
		this.pdfParams = pdfParams;
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.info({
			title: pdfParams.meritListTitle
		});
		this.pdfDocument.pageMargins([5, 20, 5, 20]);
		this.pdfDocument.defaultStyle({
			font: "OpenSans",
		});
		this.pdfDocument.pageOrientation("landscape");

		return new Observable((observer) => {
			const schoolInfo$ = this.schoolService.schoolInfo.pipe(
				filter((schoolInfo) => schoolInfo !== null),
				distinctUntilChanged()
			);
			const schoolData$ = this.dataService.schoolData.pipe(
				filter((schoolData) => schoolData !== null),
				distinctUntilChanged()
			);

			combineLatest([schoolInfo$, schoolData$])
				.pipe(take(1))
				.subscribe(([schoolInfo, schoolTypeData]) => {
					this.schoolInfo = schoolInfo;
					this.schoolTypeData = schoolTypeData;
					this.populatePdf();

					this.reportFormService.downloadReportAsPdf$(this.pdfDocument.getDefinition(), "Merit List").subscribe(
						() => {
							observer.next();
						},
						(err) => observer.error(err),
					);
				});
		});
	}

	private populatePdf() {
		this.addHeader();
		this.addMeritListTable();
	}

	private addHeader() {
		const header = new Columns([
			{
				image: this.pdfParams.schoolLogo,
				width: 70,
				height: 70,
				alignment: "left",
				margin: [0, 0, 0, 5],
			},
			new Stack([
				new Txt(this.schoolInfo.name.toUpperCase()).bold().margin([0,0,0,5]).fontSize(17).end,
				new Txt(this.schoolTypeData?.formoryear + " "+this.pdfParams.classLevel).bold().margin([0,0,0,3]).fontSize(10).end,
				new Txt(this.pdfParams.meritListTitle).bold().fontSize(10).end,
			]).width("*").alignment("center").end,
			new Stack([
				new Txt(this.schoolInfo.address).bold().margin([0,5,0,5]).fontSize(10).end,
				new Txt(this.schoolInfo.phone).bold().margin([0,0,0,5]).fontSize(10).end,
				new Txt(this.schoolInfo.email).bold().margin([0,0,0,5]).fontSize(10).end,
			]).width("auto").alignment("right").end
		]).end;

		this.pdfDocument.add(header);
	}

	private addMeritListTable() {
		const {headers, subHeaders, widths} = this.tableHeaderConfig;

		const table = new Table([
			headers,
			subHeaders,
			...this.tableBody
		]).headerRows(2).bold().fontSize(7.5).widths(widths).end;

		this.pdfDocument.add(table);
	}

	private get tableHeaderConfig() {
		const meritList = this.pdfParams.meritList;
		const assessmentColumns = this.pdfParams.assessmentColumnLabels;
		const centerAlignMargins: any = [0,7,0,0];
		const headers = meritList.columnLabels.map((label) => {
			const isSubjectColumn = meritList.subjectColumnLabels.includes(label);
			const rowSpan = isSubjectColumn ? 1 : 2;
			const colSpan = isSubjectColumn ? assessmentColumns.length : 1;

			const cell = isSubjectColumn
				? new Cell(new Txt(label).bold().alignment("center").noWrap().end).colSpan(colSpan).end
				: new Cell(new Txt(label).bold().alignment("center").margin(centerAlignMargins).end).rowSpan(rowSpan).end;

			const extraEmptyCells = Array.from({length: colSpan - 1}, () => new Txt("").end);

			return [cell, ...extraEmptyCells];
		}).reduce((acc, curr) => acc.concat(curr),[]);

		const subHeaders = meritList.columnLabels.map((label) => {
			const isSubjectColumn = meritList.subjectColumnLabels.includes(label);

			const cells: any[] = [];
			if (isSubjectColumn) {
				this.pdfParams.assessmentColumnLabels.forEach((assessmentLabel) => {
					cells.push(new Cell(new Txt(assessmentLabel).bold().alignment("center").noWrap().end).end);
				});
			}else {
				cells.push(new Txt("").end);
			}

			return cells;
		}).reduce((acc, curr) => acc.concat(curr),[]);

		const width = this.pdfParams.assessmentColumnLabels.length == 1 ? 15 : "auto";
		const resultWidths = Array.from({length: meritList.subjectColumnLabels.length * assessmentColumns.length}, () => width);
		const marksAndPositionWidth = Array.from({length: 4}, () => meritList.subjectColumnLabels.length <= 4 ? "*" : "auto");

		const widths = ["auto", "*", "auto", ...resultWidths, ...marksAndPositionWidth];

		return {headers, subHeaders, widths};
	}

	private get tableBody() {
		const meritList = this.pdfParams.meritList;
		return meritList.studentsResults.map((studentResult) => {
			const row: any[] = [];
			meritList.columnLabels.forEach((label) => {
				const isSubjectColumn = meritList.subjectColumnLabels.includes(label);

				if (isSubjectColumn) {
					const assessmentColumns = this.pdfParams.assessmentColumnLabels;
					assessmentColumns.forEach((assessmentColumn) => {
						const hasSubjectResult = studentResult[label] && studentResult[label][assessmentColumn];
						const subjectResult = hasSubjectResult ? studentResult[label][assessmentColumn]:"";
						row.push(new Txt(subjectResult).noWrap().end);
					});
				} else {
					const labelValue = studentResult[label] != null ? studentResult[label] : "";
					row.push(new Txt(labelValue.toString()).noWrap().end);
				}
			});

			return row;
		});
	}
}
