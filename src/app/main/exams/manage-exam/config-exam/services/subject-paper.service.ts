import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";
import { Observable } from "rxjs";
import { SubjectPaperPresets } from "../../../../../@core/models/exams/subject-paper-ratio";

@Injectable({
	providedIn: "root",
})
export class SubjectPaperService {
	private apiUrl = environment.apiurl;
	constructor(private httpClient: HttpClient) {}

	addSubjectPaper(
		intakeId: number,
		seriesId: number,
		subjectId: number,
		subjectPapers: any[]
	): Observable<any> {
		const params =
			"?intakeid=" +
			intakeId +
			"&seriesid=" +
			seriesId +
			"&subjectid=" +
			subjectId;

		return this.httpClient.post(
			this.apiUrl + "/results/subject_papers" + params,
			subjectPapers
		);
	}

	deleteSubjectPaper(paperId: number): Observable<any> {
		return this.httpClient.delete(
			this.apiUrl + "/results/subject_paper?paperid=" + paperId
		);
	}

	enableAllSubjectPapers(intakeId: number, seriesId: number, subjectPapers) {
		return this.httpClient.post(
			`${this.apiUrl}/results/subject_papers_multiple?intakeid=${intakeId}&seriesid=${seriesId}`,
			subjectPapers
		);
	}

	disableAllSubjectPapers(intakeId: number, seriesId: number, subjectPapers) {
		return this.httpClient.post(
			`${this.apiUrl}/results/subject_papers_multiple/disable?intakeid=${intakeId}&seriesid=${seriesId}`,
			subjectPapers
		);
	}

	saveDefaultPaperRatios(subjectPaperPreset: SubjectPaperPresets) {
		return this.httpClient.post(
			`${this.apiUrl}/results/edit_sp_presets`,
			subjectPaperPreset
		);
	}

	getSubjectPaperPresets(): Observable<any> {
		return this.httpClient.get(this.apiUrl + "/results/subject_paper_presets");
	}

	getSubjectPapers(): Observable<any> {
		return this.httpClient.get(
			this.apiUrl +
				"/results/subject_papers/preset?includeMaxScore=true&includeRatios=true"
		);
	}

	getExamDetails(intake: any, seriesid: any): Observable<any> {
		return this.httpClient.get(
			this.apiUrl +
				"/results/subject_papers?intakeid=" +
				intake +
				"&seriesid=" +
				seriesid
		);
	}

	getSinglePaperPreset(subjectId: number): Observable<any> {
		const url = `${this.apiUrl}/results/subject_papers/preset/${subjectId}?includeMaxScore=true&includeRatios=true`;
		return this.httpClient.get(url);
	}
}
