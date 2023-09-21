import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../../environments/environment";

@Injectable({
	providedIn: "root"
})
export class OlevelTranscriptsService {
	constructor(private http: HttpClient) {
	}

	getTranscripts(formValues) {
		const {academicYearId, yearSummaryTerms, streamId, yearSummarySeriesId} = formValues;

		let queryParams = `?academicYearId=${academicYearId}&streamId=${streamId}`;

		if (yearSummaryTerms) queryParams += `&yearSummaryTerms=${yearSummaryTerms}`;
		if (yearSummarySeriesId) queryParams += `&yearSummarySeriesId=${yearSummarySeriesId}`;

		return this.http.get(`${environment.apiurl}/evaluation/stream/transcripts${queryParams}`);
	}
}
