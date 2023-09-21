import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class EventsService {

	constructor(private http: HttpClient) { }

	addEvents(events: any) {
		return this.http.post(`${environment.apiurl}/schoolEvents`, events);
	}

	getEvents(eventid?: number) {
		if (eventid) {
			return this.http.get(`${environment.apiurl}/schoolEvents/${eventid}`);  
		}
		return this.http.get(`${environment.apiurl}/schoolEvents`);
	}

	getEventByDate(eventDate: number) {
		return this.http.get(`${environment.apiurl}/schoolEvents?eventdate=${eventDate}`); 
	}

	updateEvents(events: any) {
		return this.http.put(`${environment.apiurl}/schoolEvents`, events);
	}

	deleteEvents(eventId: number) {
		return this.http.delete(`${environment.apiurl}/schoolEvents/${eventId}`);
	}

	addEventSession(eventId: number, session: any) {
		return this.http.post(`${environment.apiurl}/schoolEvents/${eventId}/session`, session);
	}

	updateEventSession(eventId: number, session: any) {
		return this.http.put(`${environment.apiurl}/schoolEvents/${eventId}/session`, session);
	}

	deleteEventSession(eventId: number, sessionId: number) {
		return this.http.delete(`${environment.apiurl}/schoolEvents/${eventId}/session/${sessionId}`);
	}

	getSingleEvent(schoolEventId: number) {
		return this.http.get(`${environment.apiurl}/schoolEvents/${schoolEventId}`);
	}

	getAllEvents() {
		return this.http.get(`${environment.apiurl}/schoolEvents`);
	}

	getAllNewsLetters(): Observable<any> {
		return this.http.get(`${environment.apiurl}/newsletters`);
	}

	getSingleNewsLetter(id: any) {
		return this.http.get(`${environment.apiurl}/newsletters/${id}`);
	}

	addNewsLetter(newsLetter: any): Observable<any> {
		return this.http.post(`${environment.apiurl}/newsletters`, newsLetter);
	}

	updateNewsLetter(newsLetter: any): Observable<any> {
		return this.http.put(`${environment.apiurl}/newsletters`, newsLetter);
	}

	deleteNewsletter(id: any): Observable<any> {
		return this.http.delete(`${environment.apiurl}/newsletters/${id}`);
	}

}
