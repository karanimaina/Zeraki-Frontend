import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { AttendanceReport } from "../../models/classes/attendance-report";
import { ClassAttendance } from "../../models/classes/class-attendance";
import { IntakeAttendanceReport } from "../../models/classes/intake-attendance-report";
import { SchoolAttendanceReport } from "../../models/classes/school-attendance-report";
import { SubjectWithTopics, TopicCompetency } from "../../models/classes/subject-with-topics";
import { StudentInfo } from "../../models/student/student-info";
import { DataService } from "../../shared/services/data/data.service";
import {ClassSubject} from "../../models/subject/class-subject";

@Injectable({
	providedIn: "root"
})
export class ClassesService {

	constructor(private http: HttpClient, private dataService: DataService) { }

	addNewClass(streamDetails: { intakeId: number, streamId: number }, streamPayload) {
		if (streamDetails.intakeId && streamDetails.streamId) {
			streamPayload.intakeId = streamDetails.intakeId;
			streamPayload.streamId = streamDetails.streamId;
		}
		return this.http.post(`${environment.apiurl}/groups/class`, streamPayload);
	}

	getForms() {
		return this.http.get(`${environment.apiurl}/groups/school/forms`);
	}

	getStreams(intakeid: string) {
		return this.http.get(`${environment.apiurl}/groups/school/streams/intake?intakeid=${intakeid}`);
	}

	getClassSubject(cid: string) {
		return this.http.get(`${environment.apiurl}/groups/class/subject/${cid}`);
	}

	deleteClassTeacher(streamId: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/classteacher/${streamId}`);
	}

	deleteClassMemberTeacher(cid: number, studId: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/classmember/teacher/${cid}/${studId}`);
	}

	deleteSubjectTeacher(aid: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/subjectteacher/${aid}`);
	}

	assignClassTeacher(streamId: number, selectedTeacher: any) {
		return this.http.post(`${environment.apiurl}/groups/class/classteacher/${selectedTeacher.id}?streamid=${streamId}`, null, { headers: new HttpHeaders({ "content-type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}` }), responseType: "json" });
		// return this.http.post(`${environment.apiurl}/groups/class/classteacher/${selectedTeacher.id}?streamid=${streamId}`, this.httpOptions);
		// return this.http.post(`${environment.apiurl}/groups/class/classteacher/${selectedTeacher.id}?streamid=${streamId}`);
		// return this.http.post(`${environment.apiurl}/groups/class/classteacher/${selectedTeacher.id}?streamid=${streamId}`, null);
	}

	assignClassMemberTeacher(streamId: number, studentId: any, teacherId: any) {
		return this.http.post(`${environment.apiurl}/groups/class/classmember/teacher/${streamId}/${studentId}/${teacherId}`, null, { headers: new HttpHeaders({ "content-type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}` }), responseType: "json" });
	}

	assignSupervisor(intakeId: number, selectedTeacher: any) {
		return this.http.post(`${environment.apiurl}/groups/class/supervisor/${selectedTeacher.id}?intakeid=${intakeId}`, null, { headers: new HttpHeaders({ "content-type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}` }), responseType: "json" });
	}

	removeSupervisor(intakeId: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/supervisor/${intakeId}`);
	}

	save_streamName(stream: any) {
		return this.http.post(`${environment.apiurl}/groups/stream/name?streamid=${stream.streamid}&name=${stream.stream}`, null, { headers: new HttpHeaders({ "content-type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}` }), responseType: "json" });
	}

	deleteStream(streamId: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/stream?streamid=${streamId}`);
	}

	deleteSubjectClass(cid: number) {
		return this.http.delete(`${environment.apiurl}/groups/class/subject?classid=${cid}`);
	}

	getStreamInfo(streamId: number) {
		return this.http.get(`${environment.apiurl}/groups/school/stream/${streamId}`);
	}

	assignSubjectTeacher(streamId: number, selectedTeacher: any, subTeacherNo: number) {
		return this.http.post(`${environment.apiurl}/groups/class/subjectteacher/${streamId}/${selectedTeacher.id}?number=${subTeacherNo}`, null, { headers: new HttpHeaders({ "content-type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}` }), responseType: "json" });
	}

	getSubjects(): Observable<{ subjects: ClassSubject[] }> {
		return this.http.get<{ subjects: ClassSubject[] }>(`${environment.apiurl}/groups/subjects`);
	}

	getAll_withintakeids() {
		return this.http.get(`${environment.apiurl}/groups/forms/all_withintakeids`);
	}

	getStreamBasicDetails(classid: number) {
		return this.http.get(`${environment.apiurl}/groups/class/basicdetails?classid=${classid}`);
	}

	getStreamSubjects(streamId: number): Observable<any> {
		return this.http.get(`${environment.apiurl}/groups/subjects/stream?streamid=${streamId}`);
	}

	getClassAdmin(classId: number, streamId: number, subjectId: number, intakeId: number) {
		let url = `${environment.apiurl}/groups/class/administrator?`;

		if (classId > 0) {
			url += "&classid=" + classId;
		} else if (streamId > 0) {
			url += "&streamid=" + streamId;
			if (subjectId > 0) {
				url += "&subjectid=" + subjectId;
			}
		} else if (intakeId > 0 && !(subjectId > 0)) {
			url += "&intakeid=" + intakeId;
		}

		return this.http.get<any>(url);
	}

	getMyClasses() {
		return this.http.get(`${environment.apiurl}/groups/classes/managed`);
	}

	getClassList(streamId: number): Observable<ClassAttendance> {
		return this.http.get<ClassAttendance>(`${environment.apiurl}/groups/attendance/init/${streamId}`);
	}

	getSubjectComments(classId: number) {
		return this.http.get(`${environment.apiurl}/groups/student/subject/comments/${classId}`);
	}

	addSubjectComments(classId: number) {
		return this.http.post(`${environment.apiurl}/groups/student/subject/comments/${classId}`, null, { headers: new HttpHeaders({ "content-type": "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}` }), responseType: "json" });
	}

	getSubjectsNewCurriculum() {
		const params = "?newcurriculum=true";
		return this.http.get(`${environment.apiurl}/groups/subjects${params}`);
	}

	getForms_All_WithIntakeIds() {
		return this.http.get(`${environment.apiurl}/groups/forms/all_withintakeids`);
	}

	getNewGraduatedClasses_GraduationYears() {
		return this.http.get(`${environment.apiurl}/groups/new_graduated_classes/graduation_years`);
	}

	getBasicDetailsStream(streamid: number): Observable<any> {
		return this.http.get(`${environment.apiurl}/groups/class/basicdetails?streamid=${streamid}`);
	}

	getStudentsListIntake(intakeid: any) {
		return this.http.get(
			`${environment.apiurl}/groups/class/members/intake?intakeid=${intakeid}`
		);
	}

	getBasicDetailsSubjectClass(classid: any) {
		return this.http.get(
			`${environment.apiurl}/groups/class/basicdetails?classid=${classid}`
		);
	}

	getBasicDetailsIntake(intakeid: any) {
		return this.http.get(
			`${environment.apiurl}/groups/class/basicdetails?intakeid=${intakeid}`
		);
	}

	recordAttendance(term, streamId, attendance) {
		return this.http.post(`${environment.apiurl}/groups/attendance/record/${term}/${streamId}`, attendance);
	}

	getAttendanceReport(streamId): Observable<AttendanceReport> {
		return this.http.get<AttendanceReport>(`${environment.apiurl}/groups/attendance/report/${streamId}`);
	}

	getSchoolAttendanceReport(term: number, year: number): Observable<SchoolAttendanceReport> {
		const url = term && year
			? `${environment.apiurl}/groups/attendance/report/school?term=${term}&year=${year}`
			: `${environment.apiurl}/groups/attendance/report/school`;
		return this.http.get<SchoolAttendanceReport>(url);
	}

	getIntakeAttendanceReport(intakeId: number, selectedYear: number, selectedTerm: number): Observable<IntakeAttendanceReport> {
		let url;
		if (selectedYear && selectedTerm) {
			url = `${environment.apiurl}/groups/attendance/report/intake?intakeId=${intakeId}&year=${selectedYear}&term=${selectedTerm}`;
		} else {
			url = `${environment.apiurl}/groups/attendance/report/intake?intakeId=${intakeId}`;
		}
		return this.http.get<IntakeAttendanceReport>(url);
	}

	filterAttendanceReportByDate(startDate, endDate, streamId): Observable<AttendanceReport> {
		return this.http.get<AttendanceReport>(`${environment.apiurl}/groups/attendance/report/${streamId}?startDate=${startDate}&endDate=${endDate}`);
	}

	filterAttendanceReportByTerm(term, year, streamId): Observable<AttendanceReport> {
		return this.http.get<AttendanceReport>(`${environment.apiurl}/groups/attendance/report/${streamId}?term=${term}&year=${year}`);
	}

	getStudentsInClass(classId): Observable<StudentInfo[]> {
		return this.http.get<StudentInfo[]>(`${environment.apiurl}/groups/class/subject/members/${classId}`);
	}

	/*For O-Level schools*/
	getSubjectTopics(subjectId: number, classLevel: number, classId: number, year: number): Observable<SubjectWithTopics> {
		let url;
		if (subjectId && classLevel) {
			url = `${environment.apiurl}/topic?subjectId=${subjectId}&classLevel=${classLevel}`;
		} else if (classId) {
			url = `${environment.apiurl}/topic?classId=${classId}`;
		}

		if (year) {
			url += `&year=${year}`;
		}
		return this.http.get<SubjectWithTopics>(url);
	}

	getTopicCompetencies(topicId: number): Observable<TopicCompetency[]> {
		return this.http.get<TopicCompetency[]>(`${environment.apiurl}/topic/competency?topicId=${topicId}`);
	}

	addSubjectTopic(topic: { topicName: any; classLevel: any; subjectId: number }) {
		return this.http.post(`${environment.apiurl}/topic`, topic);
	}

	editSubjectTopic(topic: { topicName: any; classLevel: any; subjectId: number; topicId: number }) {
		return this.http.put(`${environment.apiurl}/topic`, topic);
	}

	addCompetencyArea(competency: { topicId: number; name: any }) {
		return this.http.post(`${environment.apiurl}/topic/competency`, competency);
	}

	editCompetencyArea(competency: { topicId: number; name: any; competencyId: number }) {
		return this.http.put(`${environment.apiurl}/topic/competency`, competency);
	}

	deleteCompetencyArea(competencyId: number) {
		return this.http.delete(`${environment.apiurl}/topic/competency?competencyId=${competencyId}`);
	}

	deleteSubjectTopic(topicId: number) {
		return this.http.delete(`${environment.apiurl}/topic?topicId=${topicId}`);
	}

	loadClassListOptions(intakeId:number):Observable<any> {
		const url = "groups/classlist/studentprofiles/options?intakeid=" + intakeId;
		return this.http.get(`${environment.apiurl}/${url}`);
	}

	syncSubjects() {
		return this.http.post(`${environment.apiurl}/evaluation/default`, {});
	}
}
