import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SchoolInfo } from "../../../models/school-info";
import { environment } from "../../../../../environments/environment";

@Injectable({
	providedIn: "root"
})
export class SchoolService {
	private schoolInfoSubject: BehaviorSubject<SchoolInfo>;

	constructor(private http: HttpClient) {
		this.schoolInfoSubject = new BehaviorSubject<SchoolInfo>(null!);
	}

	setSchoolInfo() {
		this.getSchool().subscribe({
			next: (info) => {
				this.schoolInfoSubject.next(info);
			},
			error: (err) => {
				console.log("Failed to set schoolInfo", err);
			}
		});
	}

	private getSchool(): Observable<any> {
		return this.http.get(environment.apiurl + "/groups/school");
	}

	get schoolInfo(): Observable<SchoolInfo> {
		return this.schoolInfoSubject.asObservable();
	}

	updateSchool(school: any): Observable<any> {
		return this.http.put(`${environment.apiurl}/groups/school`, school);
	}

	createSchool(school: any, params: string): Observable<any> {
		return this.http.post(`${environment.apiurl}/groups/school${params}`, school);
	}

}
