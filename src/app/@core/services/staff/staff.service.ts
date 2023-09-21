import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as Excel from "exceljs";
import * as fs from "file-saver";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { StaffGroup } from "../../enums/staff/staff-group";
import { Teacher } from "../../models/teacher/teacher";
import { TeacherGroup } from "../../models/teacher/teacher-group";
import { DataService } from "../../shared/services/data/data.service";
import { SchoolTypeCheckerService } from "../../shared/services/school/school-type-checker/school-type-checker.service";

@Injectable({
	providedIn: "root"
})
export class StaffService {

	header = {
		headers: new HttpHeaders().
			set("Authorization", `Bearer ${this.dataService.getToken()}`)
	};

	apiUrl = `${environment.apiurl}` + "/groups/school";

	constructor(
		private http: HttpClient,
		private dataService: DataService,
		private translate: TranslateService,
		private schoolTypeChecker: SchoolTypeCheckerService,
	) { }

	getStaffs(staffType: string) {
		return this.http.get<Teacher[]>(environment.apiurl + "/groups/school/" + staffType);
	}

	getStaffGroups(groupType: string): Observable<any> {
		return this.http.get<TeacherGroup[]>(environment.apiurl + "/groups/school/" + groupType);
	}

	updateStaff(userId: number, staffType: string, updatedData): Observable<any> {
		return this.http.post(`${environment.apiurl}/users/${staffType}/updateprofile/${userId}`, updatedData);
	}

	deleteStaff(userId: number): Observable<any> {
		return this.http.delete(this.apiUrl + "/workers/" + userId);
	}

	addStaffDetails(model: FormData): Observable<any> {
		return this.http.post(this.apiUrl + "/worker", model);
	}

	getAllStaffGroups(): Observable<any> {
		return this.http.get(this.apiUrl + "/workersgroups");
	}

	addStaffGroup(group: any[], groupType: StaffGroup): Observable<any> {
		return this.http.post(`${this.apiUrl}/${groupType}`, group);
	}

	updateStaffGroup(groupId, staffGroupName): Observable<any> {
		return this.http.post(`${environment.apiurl}/groups/staffgroup/update/${groupId}?name=${staffGroupName}`, {});
	}

	deleteStaffGroup(groupId: number): Observable<any> {
		return this.http.delete(`${environment.apiurl}` + "/groups/staffgroup/" + groupId);
	}

	generateStaffExcelTemplate() {
		// translations
		const fileName = this.translate.instant("staff.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("staff.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.workSheetName");

		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "name" },
			{ key: "title" },
			{ key: "phone" },
			{ key: "nationalIdNumber", width: 16 },
			{ key: "group" },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`staff.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);

			return (
				{
					header: `${columnHeaderName.toUpperCase()}`,
					key: `${columnHeaderName}`,
					width: item.width,
				}
			);
		});

		// create the excel document.
		const workbook = new Excel.Workbook();
		const worksheetStaffTemplate = workbook.addWorksheet(workSheetName);
		worksheetStaffTemplate.columns = columns;

		// save excel document
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, fileName + ".xlsx");
		});
	}

	staffToExcel(staffList: any[], options: any, fileName: string) {
		let tscNumberKey = "";

		if (this.schoolTypeChecker.isZimbabweSchool || this.schoolTypeChecker.isZambiaSchool) {
			tscNumberKey = "ecNumber";
		} else if (this.schoolTypeChecker.isKenyanSchool) {
			tscNumberKey = "tscNumber";
		} else {
			tscNumberKey = "regNumber";
		}

		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "name", width: options.name },
			{ key: "username", width: options.email },
			{ key: "phone", width: 15 },
			{ key: "nationalIdNumber", width: 18 },
			{ key: tscNumberKey, width: 25 },
			{ key: "gender", width: 25 },
			{ key: "group", width: 25 },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.${item.key}`);

			return (
				{
					header: `${columnHeaderName.toUpperCase()}`,
					key: `${columnHeaderName}`,
					width: item.width
				}
			);
		});

		// translations
		const workSheetName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetName");

		const nameColName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.name");
		const phoneColName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.phone");
		const nationalIdNumberColName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.nationalIdNumber");
		const groupColName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.group");
		const usernameColName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.username");
		const genderColName = this.translate.instant("staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.gender");
		const tscNumberColName = this.translate.instant(`staff.manageStaff.printFormat.excelDownload.workSheetColumnHeaders.${tscNumberKey}`);

		// create the excel document.
		const workbook = new Excel.Workbook();
		const worksheetStaffTemplate = workbook.addWorksheet(workSheetName);
		worksheetStaffTemplate.columns = columns;

		if (!options.showPhoneNumbers) {
			worksheetStaffTemplate.getColumn(phoneColName).hidden = true;
		}
		if (!options.showNationalIds) {
			worksheetStaffTemplate.getColumn(nationalIdNumberColName).hidden = true;
		}
		if (!options.showGroups) {
			worksheetStaffTemplate.getColumn(groupColName).hidden = true;
		}
		if (!options.showUsernames) {
			worksheetStaffTemplate.getColumn(usernameColName).hidden = true;
		}
		if (!options.showGender) {
			worksheetStaffTemplate.getColumn(genderColName).hidden = true;
		}
		if (!options.showTscNumber) {
			worksheetStaffTemplate.getColumn(tscNumberColName).hidden = true;
		}

		// style header column
		worksheetStaffTemplate.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};

		// add data to excel
		for (let i = 0; i < staffList.length; i++) {
			const staff = staffList[i];

			worksheetStaffTemplate.addRow({
				[nameColName]: staff.name,
				[usernameColName]: staff.email,
				[phoneColName]: staff.phone,
				[nationalIdNumberColName]: staff.nationalIdNo,
				[genderColName]: staff.gender,
				[tscNumberColName]: staff.tscNo,
				[groupColName]: staff.groupNames
			});
		}

		//save excel document
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, `${fileName}.xlsx`);
		});
		console.log("Export complete");
	}
}
