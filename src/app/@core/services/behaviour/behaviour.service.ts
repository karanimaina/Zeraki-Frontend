import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";


@Injectable({
	providedIn: "root"
})
export class BehaviourService {
  
	apiUrl: any = environment.apiurl;

	constructor(private http: HttpClient) { }

	getBehaviourTimeline(params): Observable<any> {

		return this.http.get(this.apiUrl + "/groups/behaviour/timeline" + params);
		// return b.CLASS_BEHAVIOUR_TIMELINE;
	}

	getClassStatistics(ayid: any, term: any, type: any, intake: any, stream: any): Observable<any> {
		let url = this.apiUrl + `/groups/behaviour/statistics?ayid=${ayid}&term=${term}&type=${type}`;
		if (intake != null) {
			url += "&intakeid=" + intake;
		}
		if (stream != null) {
			url += "&streamid=" + stream;
		}
		return this.http.get(url);
	}

	getClassRecent(ayid: any, term: any, type: any, page: any, intake: any, stream: any, residenceid: any): Observable<any> {
		let url = `${this.apiUrl}/groups/behaviour/recentrecords?ayid=${ayid}&page=${page}&term=${term}&type=${type}`;
		if (intake != null) {
			url += "&intakeid=" + intake;
		}
		if (stream != null) {
			url += "&streamid=" + stream;
		}
		if (residenceid != null) {
			url += "&residenceid=" + residenceid;
		}
		return this.http.get(url);
	}

	getClassStudentPoints(ayid: any, term: any, type: any, page: any, intake: any, stream: any, residenceid: any): Observable<any> {
		let url = `${this.apiUrl}/groups/behaviour/studentscummulatives?ayid=${ayid}&page=${page}&term=${term}&type=${type}`;
		if (intake != null) {
			url += "&intakeid=" + intake;
		}
		if (stream != null) {
			url += "&streamid=" + stream;
		}
		if (residenceid != null) {
			url += "&residenceid=" + residenceid;
		}
		return this.http.get(url);
	}

	getClassStudentAwards(ayid: any, term: any, type: any, page: any, intake: any, stream: any, residenceid: any): Observable<any> {
		let url = `${this.apiUrl}/groups/behaviour/awards?ayid=${ayid}&page=${page}&term=${term}&type=${type}`;
		if (intake != null) {
			url += "&intakeid=" + intake;
		}
		if (stream != null) {
			url += "&streamid=" + stream;
		}
		if (residenceid != null) {
			url += "&residenceid=" + residenceid;
		}
		return this.http.get(url);
	}

	getBehaviourStreams(): Observable<any> {
		const url = `${this.apiUrl}/groups/school/streams?historical=false&last_graduated=true`;
		return this.http.get(url);

	}

	getStreamStudents(intakeid: any) {
		const url = `${this.apiUrl}/groups/intake/students?intakeid=${intakeid}`;
		return this.http.get(url);
		// return b.NEW_BEHAVIOUR_STUDENTS;
	}

	getInfractions() {
		const url = `${this.apiUrl}/groups/behaviour/infractions?show_items=true`;
		return this.http.get(url);
		// return b.NEW_BEHAVIOUR_INFRACTIONS;
	}

	addBehaviourRecord(record: any): Observable<any> {
		return this.http.post(this.apiUrl + "/groups/behaviour/record", record);
	}

	getMerits() {
		const url = `${this.apiUrl}/groups/behaviour/merits?type=1`;
		return this.http.get(url);
	}

	getClaire() {
		const url = `${this.apiUrl}/groups/behaviour/claires`;
		return this.http.get(url);
	}

	getLeadershipPosition() {
		const url = `${this.apiUrl}/groups/behaviour/merits?type=2`;
		return this.http.get(url);
	}

	getAllApprovals(type: any, page: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infractionapprovals?page=${page}&type=${type}`;
		return this.http.get(url);
	}

	//--

	getManageBehaviourInfractions(): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infractions`;
		return this.http.get(url);
	}

	getManageBehaviourFrequency(): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/frequency`;
		return this.http.get(url);
	}

	getInfractionItems(infractionId: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infraction_items?infractionid=${infractionId}`;
		return this.http.get(url);
	}

	addInfraction(infractions: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infractions`;
		return this.http.post(url, infractions);
	}
	updateInfraction(infractions: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infractions/update`;
		return this.http.post(url, infractions);
	}
	deleteInfraction(infractionsId: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infractions/${infractionsId}`;
		return this.http.delete(url);
	}
	addInfractionItem(infractionItems: any[], infractionId: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infraction_items?infractionid=${infractionId}`;
		return this.http.post(url, infractionItems);
	}
	updateInfractionItem(infractionItems: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infraction_items/update`;
		return this.http.post(url, infractionItems);
	}
	deleteInfractionItem(infractionItemId: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/infraction_items/${infractionItemId}`;
		return this.http.delete(url);
	}

	addMerit(merits: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/merits?type=1`;
		return this.http.post(url, merits);
	}

	updateMerit(merits: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/merits/update`;
		return this.http.post(url, merits);
	}

	deleteMerit(meritid: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/merits/${meritid}`;
		return this.http.delete(url);
	}

	addLeaderhip(merits: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/merits?type=2`;
		return this.http.post(url, merits);
	}

	getClaireItems(claireId: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claire_items?claireid=${claireId}`;
		return this.http.get(url);
	}

	addClaire(claire: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claires`;
		return this.http.post(url, claire);
	}
	updateClaire(claire: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claires/update`;
		return this.http.post(url, claire);
	}
	deleteClaire(claireid: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claires/${claireid}`;
		return this.http.delete(url);
	}
	addClaireItem(item: any[], id: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claire_items?claireid=${id}`;
		return this.http.post(url, item);
	}
	updateClaireItem(item: any[]): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claire_items/update`;
		return this.http.post(url, item);
	}
	deleteClaireItem(claireid: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/claire_items/${claireid}`;
		return this.http.delete(url);
	}

	getStudentBehaviour(userId: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/student?userid=${userId}`;
		return this.http.get(url);
	}
	getStudentRecentRecords(ayid:any,page:any,term:any,userid:any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/recentrecords?ayid=${ayid}&page=${page}&term=${term}&userid=${userid}`;
		return this.http.get(url);
	}
	getStudentAwards(ayid:any,page:any,term:any,userid:any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/awards?ayid=${ayid}&page=${page}&term=${term}&userid=${userid}`;
		return this.http.get(url);
	}

	deleteRecentRecord(recordid: any): Observable<any> {
		const url = `${this.apiUrl}/groups/behaviour/record/${recordid}`;
		return this.http.delete(url);
	}


}
