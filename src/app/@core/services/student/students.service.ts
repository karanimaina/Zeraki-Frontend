import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { ClassTeacher } from "../../models/classes/class-teacher/class-teacher";
import { AddExtracurricularActivityPayload, UpdateExtracurricularActivityPayload } from "../../models/student/extracurricular-activity";
import { AddStudentResidencePayload, UpdateStudentResidencePayload } from "../../models/student/student-residence";
import { Student } from "../../models/student/student";

@Injectable({
	providedIn: "root"
})
export class StudentsService {

	constructor(private http: HttpClient) { }

	addNewStudents(intakeId: number, students) {
		return this.http.post(`${environment.apiurl}/groups/school/student?intakeid=${intakeId}`, students);
	}

	updateStudentsProfile(students) {
		return this.http.post(`${environment.apiurl}/groups/school/students/profiles?isForm=false`, students);
	}

	searchStudent(suffix: string) {
		return this.http.get<any[]>(`${environment.apiurl}/groups/student/search${suffix}`);
	}

	deleteClassTeacher(streamId: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/classteacher/${streamId}`);
	}

	deleteStudent(userId: number) {
		return this.http.delete(`${environment.apiurl}/groups/school/student/${userId}`);
	}

	getStreamInfo_ClassTeacher(streamid: number): Observable<{ ct: ClassTeacher }> {
		return this.http.get<{ ct: ClassTeacher }>(`${environment.apiurl}/groups/school/stream/${streamid}?destinationsonly=${true}`);
	}

	moveStudents(sourceStream: number, destinationStream: number, students): Observable<any> {
		return this.http.post(`${environment.apiurl}/groups/student/move?from_stream_id=${sourceStream}&to_stream_id=${destinationStream}`, students);
	}

	moveStudentsByMajor(sourceMajor: number, destinationMajor: number, students) {
		return this.http.post(`${environment.apiurl}/majors/move/student?fromMajorId=${sourceMajor}&toMajorId=${destinationMajor}`, students);
	}

	getFormStreams = (historical: any, last_graduated = false, is_message = false) => {
		let params = "";
		if (last_graduated) {
			params = "&last_graduated=" + last_graduated;
		}
		if (is_message) {
			params += "&is_message=" + is_message;
		}
		return this.http.get(`${environment.apiurl}/groups/school/streams?historical=${historical}${params}`);
	};

	getStudentsList_Stream(streamid: number, classid?: number) {
		let param = "";
		if (classid != null) {
			param = "&classid=" + classid;
		}
		return this.http.get(`${environment.apiurl}/groups/class/members?streamid=${streamid}${param}`);
	}

	getStudentsProfile(userid: any) {
		return this.http.get(`${environment.apiurl}/groups/school/student/profile/${userid}`);
	}

	updateStudentProfiles(studentProfiles) {
		return this.http.post(`${environment.apiurl}/groups/school/students/profiles?isForm=true`, studentProfiles);
	}

	getStudentResidences() {
		return this.http.get(`${environment.apiurl}/groups/student/residences`);
	}

	addStudentResidences(payload: AddStudentResidencePayload[]): Observable<any> {
		return this.http.post(`${environment.apiurl}/groups/student/residences`, payload);
	}

	updateStudentResidences(payload: UpdateStudentResidencePayload): Observable<any> {
		return this.http.put(`${environment.apiurl}/groups/student/residences`, payload);
	}

	deleteStudentResidence(residenceID: number): Observable<any> {
		return this.http.delete(`${environment.apiurl}/groups/student/residences/${residenceID}`);
	}

	getStudentMessages(userid: any, page: any, isDiscipline = false) {
		let params = "";
		if (isDiscipline) {
			params = "?discipline=true";
		}
		return this.http.get(`${environment.apiurl}/groups/student/messages/${userid}/${page}${params}`);
	}

	getStudentExtracurricularActivities(userid: any, academicYearID?: number): Observable<any> {
		let params = "";
		if (academicYearID != null && academicYearID > 0) {
			params = "?academicYearId=" + academicYearID;
		}
		return this.http.get(`${environment.apiurl}/groups/student/extracurricularactivities/${userid}${params}`);
	}

	addStudentExtracurricularActivity(payload: AddExtracurricularActivityPayload): Observable<any> {
		return this.http.post(`${environment.apiurl}/groups/student/extracurricularactivities`, payload);
	}

	updateStudentExtracurricularActivity(payload: UpdateExtracurricularActivityPayload): Observable<any> {
		return this.http.put(`${environment.apiurl}/groups/student/extracurricularactivities`, payload);
	}

	deleteStudentExtracurricularActivity(id: number): Observable<any> {
		return this.http.delete(`${environment.apiurl}/groups/student/extracurricularactivities/${id}`);
	}

	getStreamIntakeExamData(params: any, exam_list_only: any, spreadsheet = false) {
		let url = environment.apiurl + "/analytics/streamintake";
		if (params && params.length > 0) {
			url += params;
		}
		if (exam_list_only) {
			let prefix = "?";
			if (params && params.length > 0) {
				prefix = "&";
			}
			params = prefix + "exam_list_only=true";
			url += params;
		}
		if (spreadsheet) {
			return this.http.get(url, { responseType: "arraybuffer" });
		}
		return this.http.get(url);

	}

	getStudentListByStreamAndMajor(streamId, majorId): Observable<Student[]> {
		return this.http.get<Student[]>(`${environment.apiurl}/groups/class/members?streamid=${streamId}&majorid=${majorId}`);
	}

	addStudentToSubject(payload: { classId: number; admNo: string[] }) {
		return this.http.post(`${environment.apiurl}/classMember`, payload);
	}

}
