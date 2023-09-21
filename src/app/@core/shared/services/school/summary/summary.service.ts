import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { take } from "rxjs/operators";
import { SchoolSummary } from "src/app/@core/models/school-summary/summary";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class SummaryService {
	private _schoolSummarySubject$ = new BehaviorSubject<SchoolSummary>(null!);
	schoolSummary$: Observable<SchoolSummary> = new Observable();

	constructor(private http: HttpClient) {
		this.schoolSummary$ = this._schoolSummarySubject$;
	}


	getSchoolSummaryApi(): Observable<SchoolSummary> {
		return this.http.get<SchoolSummary>(`${environment.apiurl}/groups/school/summary`);
	}

	setSchoolSummary(summary?: SchoolSummary) {
		if (summary) {
			this._schoolSummarySubject$.next(summary);
			localStorage.setItem("summary", JSON.stringify(summary));
		} else {
			this.getSchoolSummaryApi().subscribe(resp => {
				// console.warn('setSchoolSummary >> ', resp);
				this._schoolSummarySubject$.next(resp);
				localStorage.setItem("summary", JSON.stringify(resp));
			});
		}
	}

	get schoolSummarySubject() {
		return this._schoolSummarySubject$;
	}

	get schoolSummary() {
		return JSON.parse(localStorage.getItem("summary")!);
		// return this._schoolSummarySubject$.value;
	}

	resetSchoolSummary() {
		this._schoolSummarySubject$.next(null!);
		localStorage.removeItem("summary");
	}
}
