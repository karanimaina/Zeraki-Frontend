import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { ExcelTemplateHeader } from "src/app/@core/models/excel/excel-template-header";
import { ExcelService } from "../../services/excel/excel.service";
import { BasicUtils } from "../../utilities/basic.utils";

@Component({
	selector: "app-excel-download-template",
	templateUrl: "./excel-download-template.component.html",
	styleUrls: ["./excel-download-template.component.scss"]
})
export class ExcelDownloadTemplateComponent implements OnInit {

	fileErrors: any[] = [];
	@Input() fileName!: string;
	@Input() workSheetName!: string;
	@Input() templateHeaders: Array<ExcelTemplateHeader> = [];
	@Output() templateHeadersChange:EventEmitter<Array<ExcelTemplateHeader>> = new EventEmitter<Array<ExcelTemplateHeader>>();
	@Input() entries: Array<any> = [];
	@Input() hasErrors!: boolean;

	@Input() labelText!: string;
	@Input() subjects?: Array<any>;

	@Output() uploadedEntries: EventEmitter<any[]> = new EventEmitter<any[]>();
	@Output() headerErrors: EventEmitter<any[]> = new EventEmitter<any[]>();

	formattedUploadedEntries: any[] = [];
	isFileSelected = false;
	inputFile = new FormControl("", [Validators.required]);
	filteredTranslatedHeaders: Array<ExcelTemplateHeader> = [];

	currentPage = 1;
	pageSize = 10;

	constructor(
		private translate: TranslateService,
	) { }

	setCurrentPage(page: number) {
		this.currentPage = page;
	}

	ngOnInit(): void {
		this.fileNameSpecified();
	}

	private fileNameSpecified() {
		if (!this.fileName)
			console.error("Filename not specified");
	}

	downloadTemplate() {
		const workSheetName = this.workSheetName || this.translate.instant("workSheet.defaults.worksheetName");

		const excelService = new ExcelService(this.fileName, workSheetName, this.translatedTemplateHeaders, this.entries);
		excelService.downloadExcelTemplate();
	}

	get translatedTemplateHeaders(): Array<ExcelTemplateHeader> {
		const defaultHeaderWidth = 15;
		const translatedHeaders = this.templateHeaders.map(templateHeader => {
			const headerName: string = templateHeader.translate ? this.translate.instant(`workSheet.headers.${templateHeader.key}`) : templateHeader.key;

			return {
				key: headerName.toUpperCase(),
				value: templateHeader.value,
				displayValue: BasicUtils.displayValue(headerName),
				width: templateHeader.width ? templateHeader.width: defaultHeaderWidth,
				type: templateHeader.type,
				meaning: templateHeader.meaning,
			};
		});

		this.templateHeadersChange.emit(translatedHeaders);
		return translatedHeaders;
	}

	async detectFiles(event: any) {
		this.fileErrors = [];
		const target: DataTransfer = <DataTransfer>(event.target);

		this.isFileSelected = target.files.length == 1;

		if (target.files.length !== 1) throw new Error(this.translate.instant("workSheet.headers.multipleFileError"));

		const uploadedEntries = await ExcelService.readUploadedFile(target);

		this.mapUploadedEntriesToRespectiveValues(uploadedEntries);

		this.inputFile.setValue("");
	}

	private mapUploadedEntriesToRespectiveValues(uploadedEntries) {
		this.formattedUploadedEntries = [];

		uploadedEntries.forEach((entry, index) => {
			if (this.fileErrors.length > 0) return;
			/**
			 * Only include header columns that available in input file.
			 */
			if (index == 0) {
				const uploadedDataColumns = Object.keys(entry);
				const filteredHeaderColumns: Array<any> = [];
				this.translatedTemplateHeaders.forEach((header) => {
					const key = uploadedDataColumns.indexOf(header.key);
					if (key !== -1) {
						filteredHeaderColumns.push(header);
					}
				});
				this.filteredTranslatedHeaders = filteredHeaderColumns;
			}
			this.formattedUploadedEntries.push(this.formattedEntry(entry));
		});
		const formattedUploadedEntries = JSON.parse(JSON.stringify((this.formattedUploadedEntries)));
		this.uploadedEntries.emit(formattedUploadedEntries);
		this.headerErrors.emit(this.fileErrors);
	}

	private formattedEntry(unformattedEntry) {
		const formattedEntry = {};
		for (let [key, value] of Object.entries(unformattedEntry)) {
			/**
			 * Sanitize the key and data.
			 */
			key = key.toString().trim();
			// eslint-disable-next-line no-self-assign
			value = value;

			const headerType = this.translatedTemplateHeaders.find(header => header.key == key)?.type;

			const headerValue = this.translatedTemplateHeaders.find(header => header.key == key)?.value || key;

			if (!this.translatedTemplateHeaders.find(header => header.key == key)?.value) {
				this.fileErrors.push(key);
				continue;
			} if (headerType == "marks") {
				formattedEntry[headerValue] = BasicUtils.cleanedMarksOrGrade(value);
			} else {
				formattedEntry[headerValue] = value;
			}
		}
		return formattedEntry;
	}

	resetPage() {
		this.inputFile.setValue("");
		this.isFileSelected = false;
	}

}
