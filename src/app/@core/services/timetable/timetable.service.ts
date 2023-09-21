import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class TimetableService {

	constructor(private http: HttpClient) { }

	getTeachers() {
		return this.http.get(`${environment.apiurl}/groups/school/teachers`);
	}

	getTeacherTimeTable(teacherId: any) {
		const url_main = "timetable/tt?teacherId="+teacherId;
		return this.http.get(`${environment.apiurl}/${url_main}`);
	}

	getClassTimeTable(streamId: number) {
		const url_main = "timetable/tt?streamId="+streamId;
		return this.http.get(`${environment.apiurl}/${url_main}`);
	}
}
