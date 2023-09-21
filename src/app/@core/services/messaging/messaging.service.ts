import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ZlIntakeMessage } from "../../models/messages/zl-intake-message";

@Injectable({
	providedIn: "root"
})
export class MessagingService {

	public smsPurchasesSubject: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor(private http: HttpClient) { }

	getSMSDetails() {
		return this.http.get(`${environment.apiurl}/groups/sms/details`);
	}

	getSMSPurchases() {
		return this.http.get(`${environment.apiurl}/groups/sms/statement`);
	}

	getMessageCategories() {
		return this.http.get(`${environment.apiurl}/groups/student/messages/categories`);
	}

	getTeachers() {
		return this.http.get(`${environment.apiurl}/groups/school/teachers`);
	}

	getTeachersGroups() {
		return this.http.get(`${environment.apiurl}/groups/school/teachersgroups`);
	}

	getOfficials() {
		return this.http.get(`${environment.apiurl}/groups/school/officials`);
	}

	getOfficialsGroups() {
		return this.http.get(`${environment.apiurl}/groups/school/officialsgroups`);
	}

	getWorkers() {
		return this.http.get(`${environment.apiurl}/groups/school/workers`);
	}

	getWorkersGroups() {
		return this.http.get(`${environment.apiurl}/groups/school/workersgroups`);
	}

	getExamStudentsAndStreams(params: any) {
		return this.http.get(`${environment.apiurl}/analytics/sms/predetails/${params}`);
	}

	markAsRead(messageId: any) {
		return this.http.post(`${environment.apiurl}/groups/message/mark?messageId=${messageId}`, null);
	}

	markAllAsRead() {
		return this.http.post(`${environment.apiurl}/groups/messages/markall`, null);
	}

	getNotifications() {
		return this.http.get(`${environment.apiurl}/groups/messages/notifications`);
	}

	getZLIntakesMessagesSummary(): Observable<{ summary: ZlIntakeMessage[] }> {
		return this.http.get<{ summary: ZlIntakeMessage[] }>(`${environment.apiurl}/groups/zl/intake`);
	}

}
