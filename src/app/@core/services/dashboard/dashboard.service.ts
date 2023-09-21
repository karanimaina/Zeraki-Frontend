import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class DashboardService {

	// header = {
	//   headers: new HttpHeaders().
	//     set('Authorization', `Bearer ${this.dataService.getToken()}`)
	// }

	constructor(private http: HttpClient) { }

	getSchoolInfo() {
		return this.http.get(`${environment.apiurl}/groups/school`);
	}

	getRolesInfo() {
		return this.http.get<any[]>(`${environment.apiurl}/users/roles/info`);
	}

	getSchoolType() {
		return this.http.get(`${environment.apiurl}/groups/schooltypes`);
	}

	getGenderType() {
		return this.http.get(`${environment.apiurl}/groups/gendertypes`);
	}

	getRecentExam() {
		return this.http.get<any[]>(`${environment.apiurl}/analytics/form/recent`);
	}

	getRecentGraduated() {
		return this.http.get<any[]>(`${environment.apiurl}/analytics/form/recent/graduated`);
	}

}
