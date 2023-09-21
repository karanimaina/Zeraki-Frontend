import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {OlevelMeritList} from "../models/olevel-merit-list";
import {environment} from "../../../../../../environments/environment";

@Injectable({
	providedIn: "root"
})
export class OlevelMeritListService {
	private apiUrl = environment.apiurl;
	constructor(private http: HttpClient) {
	}

	getMeritList(formValues: any) {
		const {academicYear, term, intakeId, streamId} = formValues;

		let params = `?academicYearId=${academicYear}&term=${term}&intakeId=${intakeId}`;
		if (streamId) {
			params += `&streamId=${streamId}`;
		}

		return this.http.get<OlevelMeritList>(`${this.apiUrl}/evaluation/merit-list${params}`);
	}
}
