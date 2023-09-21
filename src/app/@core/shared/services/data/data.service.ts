import { Injectable } from "@angular/core";
import { BehaviorSubject, fromEvent, merge, Observable, of, ReplaySubject } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as XLSX from "xlsx";
import * as Excel from "exceljs";
import * as fs from "file-saver";
import { environment } from "src/environments/environment";
import { SchoolTypeData } from "../../../models/school-type-data";
import { SchoolInfo } from "../../../models/school-info";

export interface Person {
	id: string;
	isActive: boolean;
	age: number;
	name: string;
	gender: string;
	company: string;
	email: string;
	phone: string;
	disabled?: boolean;
}

@Injectable({
	providedIn: "root"
})

export class DataService {

	schoolTData$: Observable<SchoolTypeData>=  new Observable();

	private _lToken: any = null;

	// Observable string sources
	public schoolData: BehaviorSubject<SchoolTypeData> = new BehaviorSubject<SchoolTypeData>(null!);
	public notificationsData: BehaviorSubject<any> = new BehaviorSubject(null);
	public userInitSubject: ReplaySubject<any> = new ReplaySubject<any>(null!);

	constructor(private http: HttpClient) {
		this.userInitSubject.next(JSON.parse(localStorage.getItem("user-init-subject")!));
		this.schoolTData$ = this.schoolData;
	}

	/**
   * Resets all cached/shared observables
   */
	resetAllCaches(): void {
		this.resetSchoolTypeData();
	}

	getSchoolTypeData(): Observable<SchoolTypeData> {
		return this.http.get<SchoolTypeData>(`${environment.apiurl}/groups/schooltypedata`)
			.pipe(map((resp) => {
				return { ...resp, mentionLabel: resp.mentionLabel || "Mention" };
			}));
	}

	resetSchoolTypeData() {
		this.schoolTData$ = this.getSchoolTypeData().pipe(shareReplay());
	}

	setUserInit(userInit?: any) {
		if (userInit) {
			localStorage.setItem("user-init-subject", JSON.stringify(userInit));
			this.userInitSubject.next(userInit);
		} else {
			this.getUserInit().subscribe({
				next: userInit => {
					// console.warn("userInit >> ", userInit);
					localStorage.setItem("user-init-subject", JSON.stringify(userInit));
					this.userInitSubject.next(userInit);
				}
			});
		}
	}

	getUserInit(): Observable<any> {
		return this.http.get(`${environment.apiurl}/users/init`);
	}

	setSchoolTypeData() {
		this.getSchoolTypeData().subscribe(val => {
			this.schoolData.next(val);
		});
	}

	getToken() {
		// If data is saved to localStorage due to persistence issues.
		this._lToken = JSON.parse(localStorage.getItem("za") || "{}");
		if (Object.keys(this._lToken).length == 0) {
			return null;
		}
		return this._lToken.accessToken;
	}

	send(data: any, url: string) {
		return this.http.post(`${environment.apiurl}/${url}`, data, { headers: new HttpHeaders({ "content-type": "application/json" }), responseType: "json" });
	}

	get(url: string) {
		return this.http.get(`${environment.apiurl}/${url}`);
	}

	post(data: any, url: string) {
		return this.http.post(`${environment.apiurl}/${url}`, data, { headers: new HttpHeaders({ "content-type": "application/json" }), responseType: "json" });
	}

	requestResetCode(url: string) {
		return this.http.post(`${environment.authApiUrl}/${url}`, null, { observe: "response" });
	}

	sendResetCode(data: any, url: string) {
		return this.http.post(`${environment.authApiUrl}/${url}`, data, { observe: "response" });
	}

	sendFile(data: any, url: any) {
		return this.http.post(
			url,
			data,
			{ headers: new HttpHeaders({ "content-type": `${data.type}` }), responseType: "json", reportProgress: true, observe: "events" }
		);
	}

	postNoParams(url: string) {
		return this.http.post(
			`${environment.apiurl}/${url}`,
			null,
			{ headers: new HttpHeaders({ "content-type": "application/json" }), responseType: "json" }
		);
	}

	sendFile2(data: any, url: any) {
		// console.log(data)
		const fd = new FormData();
		fd.append("file", data.file);
		// alert()
		return this.http.post(
			url,
			fd,
			// { responseType: "json", reportProgress: true, observe: 'events' }
		);
	}

	uploadSig(data: any, url: any) {
		// console.log(data)
		const fd = new FormData();
		fd.append("file", data.file);
		return this.http.post(
			url,
			fd,
		);
	}

	deleteObject(url: string) {
		return this.http.delete(`${environment.apiurl}/${url}`, { headers: new HttpHeaders({ "content-type": "application/json" }) });
	}

	getYear() {
		return this.http.get(`${environment.apiurl}/groups/year`);
	}

	getCurrentYear() {
		return this.http.get<number>(`${environment.apiurl}/groups/year`);
	}

	getForms() {
		return this.http.get(`${environment.apiurl}/groups/forms`);
	}

	getUserInitialization() {
		return this.http.get(`${environment.apiurl}/users/init`);
	}

	getIsPortable() {
		return false;
	}

	getUserImage(imagePath?: string) {
		const avatarUrl = this.defaultUserAvatar;
		if (!imagePath) {
			return avatarUrl;
		} else if (imagePath.includes("http") || imagePath.includes(avatarUrl)) {
			return imagePath;
		} else {
			imagePath = `${environment.apiurl}/groups/images/${imagePath}`;
			return imagePath;
		}
	}

	get defaultUserAvatar() {
		return "assets/img/avatar/p_avatar_blue.png";
	}

	getIsBackup() {
		//return true;
		return false;
	}

	getSchoolProfile(params?: any): Observable<SchoolInfo> {
		let url = environment.apiurl + "/groups/school";
		if (params && params.length > 0) {
			url += params;
		}
		return this.http.get<SchoolInfo>(url);
	}

	getIsMobileApp() {
		return false;
		//return true;
	}

	// TODO: add to en.json and translate!
	excelSheetDefaultFileName = "zeraki-download";
	excelSheetDefaultSheetName = "Sheet 1";

	downloadExcelTemplate(data: Array<any>, fileName = this.excelSheetDefaultFileName, sheetName = this.excelSheetDefaultSheetName) {
		// console.warn("downloadExcelTemplate >> ", data);
		const template_headers = [data];
		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(template_headers);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, sheetName);

		/* save to file */
		XLSX.writeFile(wb, `${fileName}.xlsx`);
	}

	downloadExcelSubject(
		data: Array<any>,
		fileName = this.excelSheetDefaultFileName,
		sheetName = this.excelSheetDefaultSheetName) {

		// console.warn(data);
		const widthOptions: any = {
			admno: 9,
			name: 20,
			marks: 10,
		};

		const rowData: any[] = [];
		data.forEach((d: any, i: number) => {
			if (i > 0) {

				widthOptions.admno = (d[0].toString().length > widthOptions.admno) ? d[0].toString().length + 2 : widthOptions.admno;
				widthOptions.name = (d[1].toString().length > widthOptions.name) ? d[1].toString().length + 2 : widthOptions.name;
				widthOptions.marks = (d[2].toString().length > widthOptions.stream) ? d[2].toString().length + 2 : widthOptions.stream;


				rowData.push({
					admno: d[0],
					name: d[1],
					marks: d[2]
				});
			}
		});
		const headerColumns = [
			{ header: "ADMNO", key: "admno", width: widthOptions.admno },
			{ header: "NAME", key: "name", width: widthOptions.name },
			{ header: "MARKS", key: "marks", width: widthOptions.stream }
		];

		//create new workbook
		const workbook = new Excel.Workbook();
		const worksheet = workbook.addWorksheet(sheetName);
		worksheet.columns = headerColumns;
		worksheet.addRows(rowData);

		worksheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};

		// save excel document
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, `${fileName}.xlsx`);
		});
	}

	downloadExcelSheet(
		data: Array<any>,
		fileName = this.excelSheetDefaultFileName,
		sheetName = this.excelSheetDefaultSheetName, mergeColumns = true) {
		/**UNFORMATTED EXCEL DOWNLOAD */
		const template_data = data;
		const merge = [{ s: { r: 0, c: 0 }, e: { r: 0, c: data[1]?.length-1 } }];
		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(template_data);
		mergeColumns ? ws["!merges"] = merge:"";
		ws["!cols"] = this.fitToColumn(data);
		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, sheetName);

		/* save to file */
		XLSX.writeFile(wb, `${fileName}.xlsx`);
	}

	fitToColumn(arrayOfArray) {
		// get maximum character of each column
		return arrayOfArray[0].map((a, i) => ({ wch: Math.max(...arrayOfArray.map(a2 => a2[i] ? a2[i].toString().length + 2 : 0)) }));
	}

	getColorScheme(marks: number) {
		let color;

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

	getIsMobile() {
		return true;
	}

	putnoParams(url: string) {
		return this.http.put(environment.apiurl + url, null, { responseType: "json", headers: { "Content-Type": "application/json" } });
	}


	initialSetupDone() {
		if (this.getIsBackup()) {
			return this.http.get(`${environment.apiurl}/backup/initialsetup`);
		} else {
			return of(true);
		}
	}

	checkNetworkStatus() {
		return merge(
			of(null),
			fromEvent(window, "online"),
			fromEvent(window, "offline")
		);
	}

	// Reset app
	removeUserInit() {
		localStorage.removeItem("user-init-subject");
		this.userInitSubject.next(null);
		// this.userInitSubject.unsubscribe();
	}

	removeNotification() {
		this.notificationsData.next(null);
		// this.notificationsData.unsubscribe();
	}
}
