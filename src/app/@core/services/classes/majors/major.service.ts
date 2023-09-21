import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Major } from "../../../models/major/major";
import { environment } from "../../../../../environments/environment";
import { CoefficientSystem } from "../../../models/major/subject-weight-preset";

@Injectable({
	providedIn: "root"
})
export class MajorService {
	private apiUrl = environment.apiurl;

	constructor(private httpClient: HttpClient) { }

	getMajors(): Observable<{ majors: Major[] }> {
		return this.httpClient.get<{ majors: Major[] }>(`${this.apiUrl}/majors`);
	}

	getSubjectWeightPresets(majorId: number) {
		return this.httpClient.get<CoefficientSystem>(`${this.apiUrl}/majors/subject_weight_presets?majorId=${majorId}`);
	}

	updateSubjectWeightPresets(updatedSubjectWeightPreset) {
		return this.httpClient.put(`${this.apiUrl}/majors/subject_weight_presets`, updatedSubjectWeightPreset);
	}

	getSubjectPresets(intakeId:number, seriesId:number, majorId?: number,) {
		const urlSearchParams:URLSearchParams = new URLSearchParams();
		urlSearchParams.set("seriesId",String(seriesId));
		urlSearchParams.set("intakeId",String(intakeId));
		if (majorId) urlSearchParams.set("majorId",String(majorId));
		// if(majorId!==-1) urlSearchParams.set('majorId',String(majorId))
		return this.httpClient.get(`${this.apiUrl}/majors/exam/subject_weights?${urlSearchParams}`);
	}

	updateExamSubjectPreset(updatedSubjectWeightPreset) {
		return this.httpClient.put(`${this.apiUrl}/majors/exam/subject_weights`, updatedSubjectWeightPreset);
	}
}
