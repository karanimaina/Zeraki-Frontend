import * as XLSX from "xlsx";
import {ExcelTemplateHeader} from "../../../models/excel/excel-template-header";

export class ExcelService {
	private readonly fileName: string;
	private readonly sheetName: string;
	private readonly columnHeaders: Array<ExcelTemplateHeader>;
	private readonly entries: Array<any>;

	constructor(
		fileName: string,
		sheetName: string,
		columnHeaders: Array<ExcelTemplateHeader>,
		entries: Array<any>
	) {
		this.fileName = fileName;
		this.sheetName = sheetName;
		this.columnHeaders = columnHeaders;
		this.entries = entries;
	}

	public downloadExcelTemplate() {
		const columnHeaders = this.columnHeaders.map((header) => header.key);
		const columnWidths = this.columnHeaders.map((header) => ({ wch: header.width }));

		const workbook = XLSX.utils.book_new();
		// @ts-ignore
		const worksheet = XLSX.utils.json_to_sheet(this.entries || [], { skipHeader: true, origin: "A2" });

		worksheet["!cols"] = columnWidths;

		XLSX.utils.sheet_add_aoa(worksheet, [columnHeaders], { origin: "A1" });
		XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);

		XLSX.writeFile(workbook, `${this.fileName}.xlsx`);
	}

	public static async readUploadedFile(eventTarget) {
		return new Promise((resolve, reject) => {
			const reader: FileReader = new FileReader();
			reader.onload = (e: any) => {
				/* read workbook */
				const ab: ArrayBuffer = e.target.result;
				const wb: XLSX.WorkBook = XLSX.read(ab);

				/* grab first sheet */
				const wsname: string = wb.SheetNames[0];
				const ws: XLSX.WorkSheet = wb.Sheets[wsname];

				/* save data */
				const uploadedEntries = XLSX.utils.sheet_to_json(ws, {raw: false});

				resolve(uploadedEntries);
			};

			reader.onerror = (error) => {
				reject(error);
			};
			reader.readAsArrayBuffer(eventTarget.files[0]);
		});
	}

	public downloadSchoolsExcelTemplate() {
		const combinedHeaders: Array<any> = [];
		console.table(this.columnHeaders);
		const columnHeaders = this.columnHeaders.map((header, index) => {
			if (header?.originalKey) {
				if ([
					"teachers",
					"students",
				].indexOf(header.originalKey) !== -1) {
					combinedHeaders.splice((index - 2), 0, header.displayValue);
				} else {
					combinedHeaders.push("");
				}
			}
			return header.key;
		});

		const columnWidths = this.columnHeaders.map((header) => ({wch: header.width}));

		const workbook = XLSX.utils.book_new();
		//@ts-ignore
		const worksheet = XLSX.utils.json_to_sheet(this.entries, {skipHeader: true, origin: "A3"});

		worksheet["!cols"] = columnWidths;


		const headerColumns = combinedHeaders.length > 0 ? [combinedHeaders, columnHeaders] : [columnHeaders];
		XLSX.utils.sheet_add_aoa(worksheet, headerColumns, {origin: "A1"});

		XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);

		XLSX.writeFile(workbook, `${this.fileName}.xlsx`);
	}
}
