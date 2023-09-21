import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class NotesService {
	private apiUrl = `${environment.apiurl}`;

	constructor(
		private http: HttpClient,
	) { }

	addStudentNote(payload: { studentId: number; title: string; note: string, category: string }): Observable<any> {
		return this.http.post(`${this.apiUrl}/note`, payload);
	}

	retrieveStudentNotes(studentId: number, category?: string, academicYearId?: number, term?: number, page = 0): Observable<any> {
		let url = `${this.apiUrl}/note?studentId=${studentId}&page=${page}`;

		if (category) url += `&category=${category}`;
		if (academicYearId) url += `&academicYearId=${academicYearId}`;
		if (term) url += `&term=${term}`;

		return this.http.get<any>(url);
	}

	updateStudentNote(payload: { studentId: number; title: string; note: string, category: string, noteId: number }): Observable<any> {
		return this.http.put(`${this.apiUrl}/note`, payload);
	}

	deleteStudentNote(noteId: number): Observable<any> {
		return this.http.delete(`${this.apiUrl}/note?noteId=${noteId}`);
	}

	retrieveNoteCategories(studentID: number): Observable<any> {
		return this.http.get(`${this.apiUrl}/note/category?studentId=${studentID}`);
	}
}
