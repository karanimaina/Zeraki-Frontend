import { Injectable } from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {BehaviorSubject} from "rxjs";
import {ClassSubject} from "../../models/subject/class-subject";
import {ResponseHandlerService} from "../../shared/services/response-handler/response-handler.service";

@Injectable({
	providedIn: "root"
})
export class SubjectsService {
	fetchingSubjects$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	subjects$: BehaviorSubject<ClassSubject[]> = new BehaviorSubject<ClassSubject[]>([]);
	constructor(
		private httpClient: HttpClient,
		private responseHandler: ResponseHandlerService) { }

	get subjects() {
		this.fetchSubjects();
		return this.subjects$.asObservable();
	}

	fetchSubjects() {
		this.fetchingSubjects$.next(true);
		return this.httpClient.get(`${environment.apiurl}/groups/subjects`)
			.subscribe((response: any) => {
				this.subjects$.next(response);
				this.fetchingSubjects$.next(false);
			}, (error) => {
				this.fetchingSubjects$.next(false);
				this.responseHandler.error(error, "fetchSubjects()");
			});
	}
}
