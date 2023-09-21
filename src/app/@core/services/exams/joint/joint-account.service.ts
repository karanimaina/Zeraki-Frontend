import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
// import * as Excel from "exceljs";
import * as fs from "file-saver";
import * as XLSX from "xlsx";
// import { Workbook } from 'exceljs';

@Injectable({
	providedIn: "root"
})
export class JointAccountService {

	apiUrl: string = environment.apiurl;

	constructor(private http: HttpClient) { }

	getColorScheme(marks: any) {
		let color = "";
		if (marks >= 85) {
			color = "success";
		} else if (marks >= 70) {
			color = "primary";
		} else if (marks >= 60) {
			color = "info";
		} else if (marks >= 50) {
			color = "warning";
		} else {
			color = "danger";
		}
		return color;
	}


	doPostWithParams(url: any, body: any): Observable<any> {
		return this.http.post(this.apiUrl + url, body);
	}

	doPostNoParams(params: any): Observable<any> {
		return this.http.post(this.apiUrl + params, null);
	}

	doPutNoParams(params: any): Observable<any> {
		return this.http.put(this.apiUrl + params, null);
	}

	doDelete(params: any): Observable<any> {
		return this.http.delete(this.apiUrl + params);
	}
	doGet(params: any): Observable<any> {
		return this.http.get(this.apiUrl + params);
	}
	doGetWithHeaders(params: any,): Observable<any> {
		return this.http.get(this.apiUrl + params, { headers: { responseType: "arraybuffer" } });
	}

	export_class_results_withLabelsList(schoolname: any, resp: any) {
		console.log("schoolname", schoolname);
		console.log("resp", resp);

		const sheet_name = "results";
		const document_name = resp.examname;
		const header: any = [];

		resp.labels.forEach((l: any, i: number) => {
			header.push(l.header);
		});

		const header_size = header.length;
		const ranges: any[] = [];
		const data: any[] = [];
		const merged_header: any[] = [];

		for (let i = 0; i < header_size; i++) {
			if (i === 0) {
				merged_header.push((document_name + " - " + schoolname));
			} else {
				merged_header.push("");
			}
		}

		data.push(merged_header);
		data.push(header);

		resp.list.forEach((d: any, i: number) => {
			const student: any = []; resp.labels.forEach((l: any, j: number) => {
				if (d[l.label] == undefined || d[l.label] == null) {
					student.push("");
				} else if (d[l.label].score_grade != undefined) {
					student.push(d[l.label].score_grade);
				} else {
					student.push(d[l.label]);
				}
			});
			data.push(student);
		});
		this.array_to_excel(ranges, data, sheet_name, document_name, header_size);
	}

	array_to_excel(ranges, data, sheet_name, document_name, header_size) {
		const ws_name = sheet_name;
		//console.log(ranges);
		const wb = XLSX.utils.book_new();
		const ws = this.sheet_from_array_of_arrays(data);
    
		/* add ranges to worksheet */
		ws["!merges"] = ranges;
		if (header_size > 0) {
			ws["!merges"].push({ s: "A1", e: this.getMergedHeaderEnd((header_size - 1)) + "1" });
		}
		/* add worksheet to workbook */
		wb.SheetNames.push(ws_name);
		wb.Sheets[ws_name] = ws;

		const wbout = XLSX.write(wb, { bookType: "xlsx", bookSST: false, type: "binary" });
		// fs.saveAs(new Blob([this.s2ab(wbout)], {type: "application/octet-stream"}), document_name + ".xlsx");
		const blob = new Blob([this.s2ab(wbout)], { type: "application/octet-stream" });
		const fileName = document_name + ".xlsx";

		this.custom_saver(blob, fileName);
	}
	s2ab(s: any) {
		const buf = new ArrayBuffer(s.length);
		const view = new Uint8Array(buf);
		for (let i = 0; i != s.length; ++i)
			view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}

	custom_saver(blob, fileName) {
		//Web Download
		fs.saveAs(blob, fileName);
		//Android Download

		/*var reader = new FileReader;
     reader.onload = function () {
     var base64data = reader.result;
     Android.downloadFile(base64data, fileName);
     };
     reader.readAsDataURL(blob);*/
	}

	sheet_from_array_of_arrays(data, opts?: any) {
		const ws = {};
		const range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
		for (let R = 0; R != data.length; ++R) {
			for (let C = 0; C != data[R].length; ++C) {
				if (range.s.r > R)
					range.s.r = R;
				if (range.s.c > C)
					range.s.c = C;
				if (range.e.r < R)
					range.e.r = R;
				if (range.e.c < C)
					range.e.c = C;
				const cell: any = { v: data[R][C] };
				if (cell.v == null)
					continue;
				const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

				if (typeof cell.v === "number")
					cell.t = "n";
				else if (typeof cell.v === "boolean")
					cell.t = "b";
				else if (cell.v instanceof Date) {
					cell.t = "n";
					// cell.z = XLSX.SSF._table[14];
					cell.z = XLSX.SSF.get_table[14];
					cell.v = this.datenum(cell.v);
				} else
					cell.t = "s";

				ws[cell_ref] = cell;
			}
		}
		if (range.s.c < 10000000)
			ws["!ref"] = XLSX.utils.encode_range(range);
		return ws;
	}

	getMergedHeaderEnd(end: any) {
		const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ"];
		return cols[end];
	}

	datenum(v, date1904?) {
		if (date1904)
			v += 1462;
		const epoch: any = Date.parse(v);
		const a: any = new Date(Date.UTC(1899, 11, 30));
		const b: any = (epoch - a);
		return b / (24 * 60 * 60 * 1000);
	}

}
