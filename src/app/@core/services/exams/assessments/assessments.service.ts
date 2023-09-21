import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { AssessmentAdditionPayload, AssessmentUpdatePayload } from "src/app/@core/models/assessments/payload";
import { AssessmentResponse } from "src/app/@core/models/assessments/assessment-reponse";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class AssessmentsService {
	private apiUrl = `${environment.apiurl}`;

	constructor(
		private http: HttpClient,
	) { }

	addAssessment(payload: AssessmentAdditionPayload): Observable<any> {
		return this.http.post(`${this.apiUrl}/assessment`, payload);
	}

	getAssessments(classId: number, academicYearId?: number, year?: string) {
		let url = `${this.apiUrl}/assessment?classId=${classId}`;

		if (academicYearId) url += `&ayid=${academicYearId}`;
		if (year) url += `&year=${year}`;

		return this.http.get<AssessmentResponse>(url);
	}

	getAssessmentTypes() {
		return this.http.get<string[]>(`${this.apiUrl}/assessment/types`);
	}

	updateAssessment(payload: AssessmentUpdatePayload): Observable<any> {
		return this.http.put(`${this.apiUrl}/assessment/edit`, payload);
	}

	deleteAssessment(assesssmentId: number): Observable<any> {
		return this.http.delete(`${this.apiUrl}/assessment?interrogationId=${assesssmentId}`);
	}

	unpublishAssessment(assesssmentId: number): Observable<any> {
		return of({ message: "Assessment unpublished successfully" }).pipe(delay(2000));
	}
}
