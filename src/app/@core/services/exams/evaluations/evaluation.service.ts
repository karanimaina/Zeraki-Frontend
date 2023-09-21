import { Injectable } from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CompetencyArea} from "../../../models/evaluation/competency-area";
import {EvaluationType} from "../../../models/evaluation/evaluation-type";
import {EvaluationResults} from "../../../models/evaluation/evaluation-results";
import {EvaluationList} from "../../../models/evaluation/evaluation-list";
import {EvaluationReport} from "../../../models/evaluation/evaluation-report";
import {ReportForm} from "../../../models/evaluation/report-form";
import {SubjectWithTopics} from "../../../models/classes/subject-with-topics";
import {
	AssessmentReport,
	IntakeAssessmentReport
} from "../../../models/evaluation/assessment-report";
import {OlevelAcademicYear} from "../../../models/olevel/olevel-academic-year";
import {map} from "rxjs/operators";
import {TermExam} from "../../../../main/printouts/olevels/models/term-exam";

@Injectable({
	providedIn: "root"
})
export class EvaluationService {
	apiUrl = `${environment.apiurl}`;

	constructor(private http: HttpClient) { }

	getAcademicYears(): Observable<{schoolId: number, academicYears: OlevelAcademicYear[] }> {
		return this.http.get<{schoolId: number, academicYears: OlevelAcademicYear[] }>(`${this.apiUrl}/academicYears`);
	}

	getClassName(classId: number): Observable<{className: string, streamId: number}> {
		return this.http.get<{className: string, streamId: number}>(`${this.apiUrl}/evaluation/class?classId=${classId}`);
	}

	createEvaluation(evaluation: any) {
		return this.http.post(`${this.apiUrl}/evaluation`, evaluation);
	}

	createExam(data: { maximumScore: number; classId: number; year: any; term: any }) {
		return this.http.post(`${this.apiUrl}/o-level`, data);
	}

	getEvaluations(classId: number, acadYear: number, termID?: number): Observable<EvaluationList> {
		let url: string;

		if(acadYear) {
			url = `${this.apiUrl}/evaluation?classId=${classId}&academicYearId=${acadYear}`;
		}else {
			url = `${this.apiUrl}/evaluation?classId=${classId}`;
		}

		if (termID) url = `${url}&term=${termID}`;

		return this.http.get<EvaluationList>(url);
	}

	getProjects(classId: number, acadYear: number, termID?: number): Observable<EvaluationList> {
		let url: string;

		if(acadYear) {
			url = `${this.apiUrl}/evaluation/project?classId=${classId}&academicYearId=${acadYear}`;
		}else {
			url = `${this.apiUrl}/evaluation/project?classId=${classId}`;
		}

		if (termID) url = `${url}&term=${termID}`;

		return this.http.get<EvaluationList>(url);
	}

	getEvaluation(id: number) {
		return this.http.get(`${this.apiUrl}/evaluation/${id}`);
	}

	getExams(classId: number, acadYear: number, termID?: number) {
		let url: string;

		if(acadYear) {
			url = `${this.apiUrl}/o-level?classId=${classId}&academicYearId=${acadYear}`;
		}else {
			url = `${this.apiUrl}/o-level?classId=${classId}`;
		}

		if (termID) url = `${url}&term=${termID}`;

		return this.http.get<EvaluationList>(url);
	}

	getExamsPerAcademicYearAndStream(academicYearId: number, streamId: number): Observable<TermExam[]> {
		return this.http.get<any[]>(`${this.apiUrl}/o-level/year?academicYearId=${academicYearId}&streamId=${streamId}`)
			.pipe(
				map(examsResponse => {
					const termExams: TermExam[] = [];
					examsResponse?.forEach(term => {
						const examsPerTerm = term.exams.map(exam => {
							return {
								...exam,
								term: "Term " + term.term
							};
						});
						termExams.push(...examsPerTerm);
					});

					return termExams;
				})
			);
	}

	getCompetencies(topicId: number): Observable<CompetencyArea[]> {
		return this.http.get<CompetencyArea[]>(`${this.apiUrl}/evaluation/competencies?topicId=${topicId}`);
	}

	getEvaluationTypes(): Observable<EvaluationType[]> {
		return this.http.get<EvaluationType[]>(`${this.apiUrl}/evaluation/type`);
	}

	uploadResults(evaluationId: number, maxScore: number, results: any) {
		return this.http.post(`${this.apiUrl}/evaluation/marks?evaluationId=${evaluationId}&maxScore=${maxScore}`, results);
	}

	uploadExamResults(evaluationId: number, maxScore: number, studentMarks: Array<{ studentId: number; rawMark: number }>) {
		return this.http.post(`${this.apiUrl}/o-level/marks?evaluationId=${evaluationId}&maxScore=${maxScore}`, studentMarks);
	}

	getExamSeriesByStream(streamID: number, academicYearID: number, term: number, intakeID?: number): Observable<any> {
		let url = `o-level/stream?academicYearId=${academicYearID}&term=${term}`;
		if (intakeID) url += `&intakeId=${intakeID}`;
		if (streamID) url += `&streamId=${streamID}`;
		return this.http.get(`${this.apiUrl}/${url}`);
	}

	getExamReport(seriesID: number, streamID?: number, intakeID?: number): Observable<any> {
		let url = `${this.apiUrl}/o-level/report?seriesId=${seriesID}&intakeId=${intakeID}`;
		if (streamID)	url += `&streamId=${streamID}`;
		return this.http.get(url);
	}

	uploadProjectResults(projectId: number, maxScore: number, studentMarks: Array<{ studentId: number; rawMark: number; comment:string }>) {
		return this.http.post(`${this.apiUrl}/evaluation/project/marks?projectId=${projectId}&maxScore=${maxScore}`, studentMarks);
	}

	getEvaluationResults(evaluationId: number): Observable<EvaluationResults> {
		return this.http.get<EvaluationResults>(`${this.apiUrl}/evaluation/marks?evaluationId=${evaluationId}`);
	}

	getExamResults(examId: number): Observable<EvaluationResults> {
		return this.http.get<EvaluationResults>(`${this.apiUrl}/o-level/marks?examId=${examId}`);
	}

	deleteEvaluation(evaluationId: number) {
		return this.http.delete(`${this.apiUrl}/evaluation?evaluationId=${evaluationId}&reallocate=true`);
	}

	deleteExam(examId: number) {
		return this.http.delete(`${this.apiUrl}/o-level?examId=${examId}&reallocate=true`);
	}

	deleteProject(projectId: number) {
		return this.http.delete(`${this.apiUrl}/evaluation/project?projectId=${projectId}`);
	}

	deleteMarks(factId: number) {
		return this.http.delete(`${this.apiUrl}/evaluation/mark?factId=${factId}`);
	}

	deleteProjectMarks(factId: number) {
		return this.http.delete(`${this.apiUrl}/evaluation/project/mark?factId=${factId}`);
	}

	getEvaluationReport(academicYearId: number, term: number, classId: number): Observable<EvaluationReport> {
		return this.http.get<EvaluationReport>(`${this.apiUrl}/evaluation/class/report?academicYearId=${academicYearId}&term=${term}&classId=${classId}`);
	}

	getEvaluationReportForms(year: number, term: number, streamId: number, seriesId?: number, yearSummaryTerms?: string, yearSummaryExams?: string): Observable<ReportForm> {
		let url = `${this.apiUrl}/evaluation/stream/report-form?academicYearId=${year}&term=${term}&streamId=${streamId}`;
		if (seriesId) url += `&seriesId=${seriesId}`;
		if (yearSummaryTerms) url += `&yearSummaryTerms=${yearSummaryTerms}`;
		if (yearSummaryExams) url += `&yearSummaryExams=${yearSummaryExams}`;

		return this.http.get<ReportForm>(url);
	}

	getEvaluationReportFormForStudent(year, term, studentId): Observable<ReportForm> {
		return this.http.get<ReportForm>(`${this.apiUrl}/evaluation/stream/report-form?academicYearId=${year}&term=${term}&studentId=${studentId}`);
	}

	saveStudentComment(data) {
		return this.http.post(`${this.apiUrl}/evaluation/remark`, data);
	}

	getSubjectTopics(classId: number) {
		return this.http.get<SubjectWithTopics>(`${this.apiUrl}/evaluation/topic?classId=${classId}`);
	}

	getProjectResults(projectId: number) {
		return this.http.get<EvaluationResults>(`${this.apiUrl}/evaluation/project/marks?projectId=${projectId}`);
	}

	getIntakeAssessmentReport(intakeId: number, term: number, year: number): Observable<IntakeAssessmentReport> {
		return this.http.get<IntakeAssessmentReport>(`${this.apiUrl}/report/intake?intakeid=${intakeId}&term=${term}&year=${year}`);
	}

	getAssessmentReport(): Observable<AssessmentReport> {
		return this.http.get<AssessmentReport>(`${this.apiUrl}/report/forms`);
	}
}
