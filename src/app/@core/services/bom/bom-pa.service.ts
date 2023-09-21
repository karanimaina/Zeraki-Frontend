import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class BomPaService {

	apiUrl = `${environment.apiurl}` + "/groups/school";

	constructor(
    private http: HttpClient,
    private translate: TranslateService,
	) { }

	addOfficialDetails(payload: FormData):Observable<any> {
		return this.http.post(this.apiUrl+"/official", payload);
	}

	getOfficialGroups(): Observable<any> {
		return this.http.get(this.apiUrl+"/officialsgroups");
	}

	addOfficialGroup(group:any[]):Observable<any> {
		return this.http.post(this.apiUrl+"/officialsgroups",group);
	}

	updateOfficialGroup(params:string): Observable<any> {
		return this.http.post(`${environment.apiurl}`+"/groups/staffgroup/update/"+params,null);
	}

	deleteOfficialGroup(groupId:number):Observable<any> {
		return this.http.delete(`${environment.apiurl}`+"/groups/staffgroup/"+groupId);
	}
}
