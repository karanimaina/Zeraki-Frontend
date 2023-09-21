import { Injectable } from "@angular/core";
import * as Excel from "exceljs";
import * as fs from "file-saver";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { TeacherGroup } from "../../models/teacher/teacher-group";

@Injectable({
	providedIn: "root"
})
export class TeacherService {

	teacherUrl = `${environment.apiurl}/groups`;

	constructor(
		private http: HttpClient,
		private translate: TranslateService
	) { }

	addTeacherByDetail(addTeacher: any): Observable<any> {
		const header = new HttpHeaders();
		header.delete("Content-Type");
		header.set("Content-Type", "multipart/form-data");
		header.delete("Accept");
		header.set("Accept", "application/json");
		return this.http.post(this.teacherUrl + "/school/teacher", addTeacher, { headers: header });
	}

	setAdmin(userId, isAdmin): Observable<any> {
		return this.http.post(`${environment.apiurl}/users/teacher/makeadmin/${userId}?admin=${isAdmin}`, {});
	}

	setSuperAdmin(userId: number, isSuperAdmin: boolean): Observable<any> {
		return this.http.post(`${environment.apiurl}/users/teacher/makeadmin/${userId}?superAdmin=${isSuperAdmin}`, {});
	}

	getAllTeacherGroups(): Observable<TeacherGroup[]> {
		// return TEACHER_GROUPS;
		return this.http.get<TeacherGroup[]>(this.teacherUrl + "/school/teachersgroups");
	}

	getUserRoles_Info_Teacher(userid: number) {
		return this.http.get(environment.apiurl + "/users/roles/info?userid=" + userid);
	}

	addTeacherGroup(teacherGroup: any[]): Observable<any> {
		return this.http.post(this.teacherUrl + "/school/teachersgroups", teacherGroup);
	}

	editTeacherGroup(teacherGroup: any): Observable<any> {
		return this.http.post(this.teacherUrl + "/staffgroup/update/" + teacherGroup, null);
	}

	deleteTeacherGroup(teacherGroupId: number): Observable<any> {
		return this.http.delete(this.teacherUrl + "/staffgroup/" + teacherGroupId);
	}

	generateTeacherExcelTemplate() {
		// translations
		const fileName = this.translate.instant("teachers.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("teachers.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.workSheetName");

		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "name" },
			{ key: "phone" },
			{ key: "tscNumber" },
			{ key: "nationalIdNumber", width: 16 },
			{ key: "gender" },
			{ key: "group" },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`teachers.add.uploadFromSpreadSheetOptionForm.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);

			return (
				{
					header: `${columnHeaderName.toUpperCase()}`,
					key: `${columnHeaderName}`,
					width: item.width
				}
			);
		});

		// create the excel document.
		const workbook = new Excel.Workbook();
		const worksheet_teacher_template = workbook.addWorksheet(workSheetName);
		worksheet_teacher_template.columns = columns;

		// save excel document
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, fileName + ".xlsx");
		});
	}
}


