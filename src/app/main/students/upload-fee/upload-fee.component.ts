import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import * as moment from "moment";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import * as XLSX from "xlsx";

@Component({
	selector: "app-upload-fee",
	templateUrl: "./upload-fee.component.html",
	styleUrls: ["./upload-fee.component.scss"]
})
export class UploadFeeComponent implements OnInit {
	fee_upload_success = false;
	custom_errors: any = [];
	rightSidebar = false;
	showLoading = false;
	sheet_headers: any[] = [];
	fees: { students: any[], timestamp: any, date: any, term: any, year: any, sms: any, message: string } = { students: [], timestamp: undefined, date: moment(new Date(), "DD/MM/YYYY"), term: undefined, year: undefined, sms: undefined, message: "" };
	isFeeBalance = true;
	// valid_headers_template = ["ADMNO", "NAME", "TERM_BALANCE", "NEXT_TERM_FEES"];
	valid_headers_template: any[] = [];
	allowed_headers: any[] = [];
	headers_template: any[] = [];
	sheet_headers_template: any[] = [];
	valid_years: any[] = [];
	currentYear!: number;
	forms: any;
	results_file: any;


	isFileSelected = false;
	data: any[] = [];
	@ViewChild("sendFeeSwal") public readonly sendFeeSwal!: SwalComponent;

	constructor(
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private errorHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
			{ key: "termBalance" },
			{ key: "nextTermFees" },
		];

		// generate translated excel columns
		const columns: any[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`students.up_fee.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		this.valid_headers_template = [...columns];

		// console.warn("this.fees.date >> ", this.fees.date);
		this.getCurrentYear();
		// this.getForms();
		this.updateTemplate();
	}

	initItems() {
		this.fee_upload_success = false;
		this.custom_errors = [];
		this.rightSidebar = false;
		this.showLoading = false;
		this.results_file = "";
	}

	getCurrentYear() {
		this.dataService.getYear().subscribe((val: any) => {
			// console.warn("getCurrentYear >> ", val);
			this.currentYear = val;
			this.fees.year = this.currentYear;
			this.valid_years = [...this.valid_years, this.currentYear, this.currentYear + 1];
			// console.warn("this.valid_years >> ", this.valid_years);
		});
	}

	getForms() {
		this.dataService.getForms().subscribe((val: any) => {
			// console.warn("getForms >> ", val);
			this.forms = val;
		});
	}

	toggleFeeChange(option: string) {
		console.warn("Range option", option);
		switch (option) {
		case "current":
			this.isFeeBalance = true;
			this.updateTemplate();
			this.fees.students = [];
			break;
		case "next_term":
			this.isFeeBalance = false;
			this.updateTemplate();
			this.fees.students = [];
			break;

		default:
			this.isFeeBalance = true;
			this.updateTemplate();
			this.fees.students = [];
			break;
		}
	}

	updateTemplate() {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
			{ key: "termBalance" },
			{ key: "nextTermFees" },
		];

		// generate translated excel columns
		const columns: any[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`students.up_fee.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		// this.headers_template = ["ADMNO", "NAME", "TERM_BALANCE"];
		this.headers_template = columns.slice(0, 3); // first three

		// translations
		const admissionNumberColName = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.admno");
		const admissionNumberColNameMeaning = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.admnoMeaning");
		const nameColName = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.name");
		const nameColNameMeaning = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.nameMeaning");
		const termBalanceColName = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.termBalance");
		const termBalanceColNameMeaning = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.termBalanceMeaning");
		const nextTermFeesColName = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.nextTermFees");
		const nextTermFeesColNameMeaning = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetColumnHeaders.nextTermFeesMeaning");

		this.allowed_headers = [];
		this.allowed_headers.push({ column: admissionNumberColName.toUpperCase(), meaning: admissionNumberColNameMeaning });
		this.allowed_headers.push({ column: nameColName.toUpperCase(), meaning: nameColNameMeaning });
		this.allowed_headers.push({ column: termBalanceColName.toUpperCase(), meaning: termBalanceColNameMeaning });
		if (!this.isFeeBalance) {
			this.headers_template.push(nextTermFeesColName.toUpperCase());
			this.allowed_headers.push({ column: nextTermFeesColName.toUpperCase(), meaning: nextTermFeesColNameMeaning });
		}
		this.sheet_headers_template = this.headers_template;
	}

	downloadTemplate() {
		// translations
		const fileName = this.translate.instant("students.up_fee.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("students.up_fee.excelTemplateDownload.workSheetName");

		// this.dataService.downloadExcelTemplate(this.headers_template, "Upload Student Fees - Template", "Upload Fees");
		this.dataService.downloadExcelTemplate(this.headers_template, fileName, workSheetName);
	}

	detectFiles(event: any) {
		this.fees.students = [];
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		target.files.length == 1 ? this.isFileSelected = true : this.isFileSelected = false;

		const multipleFilesError = this.translate.instant("students.up_fee.multipleFilesError");
		if (target.files.length !== 1) throw new Error(multipleFilesError);
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			/* read workbook */
			const ab: ArrayBuffer = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(ab);

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
			this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });
			this.sheet_headers = this.data[0];

			this.data.splice(0, 1);

			const merged: any = [];
			this.data.forEach((row: any) => {
				const res: any = {};
				for (let index = 0; index < this.valid_headers_template.length; ++index) {
					res[this.valid_headers_template[index].toLocaleLowerCase()] = row[index];
				}
				merged.push(res);
				// console.warn(`merged ${index} >> `, res);
			});

			// console.warn("merged TOTAL>> ", merged);

			this.fees.students = merged;
			this.fees.students.forEach((dt: any) => {
				if (this.isFeeBalance) {
					dt["next_term_fees"] = 0;
				}
				dt["term_balance"] = this.getCleanedNumber(dt["term_balance"]);
				dt["next_term_fees"] = this.getCleanedNumber(dt["next_term_fees"]);
			});

			// console.warn("this.fees.students >> ", this.fees.students[0]);
		};

		reader.readAsArrayBuffer(target.files[0]);
	}

	getCleanedNumber(value: any) {
		value = value?.toString();
		if (value !== undefined && value !== null) {
			value = value.replace(/\s/g, "");
			value = value.replace(/[^\d.-]/gi, "").trim();
		}
		value = Number(value);
		if (value == null || isNaN(value)) {
			value = null;
		}
		return value;
	}

	uploadFeeStatements(form: NgForm) {
		this.initItems();
		this.fees.timestamp = this.fees.date.toDate().getTime();
		let has_header_error = false;
		let header_error_text = this.translate.instant("students.up_fee.forbiddenColsError");
		const header_error: any = { msg: [], allowed_headers: [] };
		header_error.title = this.translate.instant("students.up_fee.forbiddenCols");
		// console.warn("this.sheet_headers >> ", this.sheet_headers);

		this.sheet_headers.forEach((sh: any) => {
			let header_exists = false;
			this.valid_headers_template.forEach(ht => {
				if (sh.toString().trim().toLowerCase() == ht.trim().toLowerCase()) {
					header_exists = true;
				}
			});
			if (!header_exists) {
				if (has_header_error) {
					header_error_text += ", " + sh;
				} else {
					header_error_text += sh;
				}
				has_header_error = true;
			}
		});

		if (has_header_error) {
			header_error.msg.push(header_error_text);
			header_error.allowed_headers = this.allowed_headers;
			this.custom_errors.push(header_error);
			this.rightSidebar = true;
		} else {
			if (this.fees != null && this.fees.students != null && this.fees.students.length > 0) {
				this.showLoading = true;
				const isBalance = (this.isFeeBalance);
				this.dataService.send(this.fees, "groups/fees?balance=" + isBalance).subscribe({
					next: (resp: any) => {
						this.fee_upload_success = true;
						console.log(resp.message);
						form.resetForm();

						const message = this.translate.instant("students.up_fee.toastMessages.success");
						this.toastService.success(message);
					},
					error: error => {
						this.showLoading = false;
						const consoleMessage = `uploadFeeStatements() >> ${error}`;
						this.errorHandler.error(error.error, consoleMessage);
						this.custom_errors = error.error;
						this.rightSidebar = true;

						// if (error.status == 422) {
						// 	const message = this.translate.instant("students.up_fee.toastMessages.error");
						// 	this.custom_errors = error.error;
						// 	this.rightSidebar = true;
						// }
					}
				});
			}
		}
	}

}
