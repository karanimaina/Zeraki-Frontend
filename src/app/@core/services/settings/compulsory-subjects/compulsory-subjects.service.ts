import {Injectable} from "@angular/core";
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CompulsorySubject} from "../../../models/subject/compulsory-subject";

@Injectable({
	providedIn: "root"
})
export class CompulsorySubjectsService {
	apiUrl = environment.apiurl;
	constructor(private httpClient: HttpClient) {
	}

	getCompulsorySubjects(): Observable<CompulsorySubject[]> {
		return this.httpClient.get<CompulsorySubject[]>(`${this.apiUrl}/compulsorySubject`);
	}

	addCompulsorySubjects(selectedSubjectIds: any) {
		return this.httpClient.post(`${this.apiUrl}/compulsorySubject`, selectedSubjectIds);
	}

	removeCompulsorySubject(subject: CompulsorySubject) {
		return this.httpClient.delete(`${this.apiUrl}/compulsorySubject?compulsorySubjectId=${subject.compulsorySubjectid}`);
	}
}
