import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AcademicYear } from "../../../models/common/academic-year";

@Injectable({
	providedIn: "root"
})
export class CommonRequestsService {
	apiUrl = `${environment.apiurl}`;

	constructor(
    private http: HttpClient,
	) { }

	getAcademicYears(): Observable<{schoolId: number, academicYears: AcademicYear[] }> {
		return this.http.get<{ schoolId: number, academicYears: AcademicYear[] }>(`${this.apiUrl}/academicYears`);
	}
}
