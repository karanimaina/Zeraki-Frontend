import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { DataService } from "../../shared/services/data/data.service";

@Injectable({
	providedIn: "root"
})
export class VacancyService {

	constructor(private http: HttpClient, private dataService: DataService) { }

	getAllVacancies(type: number, page: number) {
		// https://localhost:8181/api/vacancy?title=in sch&vacancyType=2&currentPage=1
		return this.http.get(`${environment.apiurl}/vacancy?vacancyType=${type}&currentPage=${page}`);
	}

	searchVacancies(type: number, searchTerm?: string, subjectId?: string) {
		if (searchTerm || searchTerm == "") {
			return this.http.get(`${environment.apiurl}/vacancy?title=${searchTerm}&vacancyType=${type}`);
		} else {
			console.warn("ELSE >>");
			return this.http.get(`${environment.apiurl}/vacancy?vacancyType=${type}&subjectId=${subjectId}`);
		}
	}

	saveVacancy(vacancy: any) {
		return this.http.post(`${environment.apiurl}/vacancy`, vacancy, {headers: new HttpHeaders({"content-type":  "application/x-www-form-urlencoded", "Authorization": `Bearer ${this.dataService.getToken()}`}), responseType: "json"});
	}

	saveVacancyFormData(vacancy: any) {
		console.warn("save final >> ", vacancy);
		return this.http.post(`${environment.apiurl}/vacancy`, vacancy);
	}

	updateVacancy(vacancy: any) {
		console.warn("update final >> ", vacancy);
		return this.http.put(`${environment.apiurl}/vacancy`, vacancy);
	}

	deleteVacancy(vacancyId: any) {
		return this.http.delete(`${environment.apiurl}/vacancy?vacancyId=${vacancyId}`);
	}

	searchVacancy(type: number, page: number, searchTerm: any) {
		console.warn("searchTerm >> ", searchTerm);
		return this.http.get(`${environment.apiurl}/vacancy?title=${searchTerm}&currentPage=${page}&vacancyType=${type}`);
	}


	getAllSwaps(page: number) {
		return this.http.get(`${environment.apiurl}/swap?currentPage=${page}`);
	}

	saveSwap(swap: any) {
		return this.http.post(`${environment.apiurl}/swap`, swap);
	}

	updateSwap(swap: any) {
		return this.http.put(`${environment.apiurl}/swap`, swap);
	}

	deleteSwap(swapId: any) {
		return this.http.delete(`${environment.apiurl}/swap/${swapId}`);
	}

	searchSwap(countyToId: number, subjectId?: number) {
		if (countyToId == 0 && (subjectId && subjectId > 0)) {
			return this.http.get(`${environment.apiurl}/swap?subjectId=${subjectId}`);
		} else if(countyToId > 0) {
			console.warn("ELSE >>");
			return this.http.get(`${environment.apiurl}/swap?countyToId=${countyToId}`);
		} else {
			return this.http.get(`${environment.apiurl}/swap?currentPage=1`);
		}
	}
}
