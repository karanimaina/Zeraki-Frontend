import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class MentionService {
	apiUrl: string = environment.apiurl;

	constructor(private http: HttpClient) { }

	addMention(name: string, mentionListPresets: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/mentions/${name}`, mentionListPresets);
	}

	getMentionsMapping(): Observable<any> {
		//return exams.GRADE_MAPPING;
		return this.http.get(this.apiUrl + "/mentions");
	}

	deleteMention(mentionId): Observable<any> {
		return this.http.delete(`${this.apiUrl}/mentions/${mentionId}`);
	}
}
