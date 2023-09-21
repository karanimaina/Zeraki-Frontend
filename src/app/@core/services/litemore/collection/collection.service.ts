import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";

@Injectable({
	providedIn: "root"
})
export class CollectionService {

	constructor(private httpClient: HttpClient) { }

	updateCollection(payload) {
		return this.httpClient.post(`${environment.apiurl}/groups/invoice/update`, payload);
	}
}
