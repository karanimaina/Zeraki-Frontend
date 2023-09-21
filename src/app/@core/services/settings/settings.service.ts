import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";
import { OptionGroupMapper } from "../../models/settings/school-options/option-group-mapper";
import { BehaviorSubject, Observable } from "rxjs";
import { OptionGroup } from "../../models/settings/school-options/option-group";

@Injectable({
	providedIn: "root"
})
export class SettingsService {

	private _schoolOptionsSubject: BehaviorSubject<any> = new BehaviorSubject(null);
	constructor(private http: HttpClient) { }

	getGenderTypes() {
		return this.http.get(`${environment.apiurl}/groups/gendertypes`);
	}

	getBoardingStatus() {
		return this.http.get<Array<string>>(`${environment.apiurl}/groups/boardingStatus`);
	}

	getHeadTitles() {
		return this.http.get(`${environment.apiurl}/groups/schoolHeadTitles`);
	}

	getSchoolOptions() {
		return this.http.get(`${environment.apiurl}/groups/school/options`)
			.pipe(map((schoolOptions: any) => this.setSchoolOptions(new OptionGroupMapper(schoolOptions.option_groups).getOptionGroups())));
	}

	getMessengers() {
		return this.http.get(`${environment.apiurl}/groups/school/messengers`);
	}

	setSchoolOptions(options?: OptionGroup[]) {
		if (!options) {
			this.getSchoolOptions().subscribe(); 
		} else {
			this._schoolOptionsSubject.next(options);
		}
	}

	getSchoolOptionsSubject(): Observable<OptionGroup[]> { 
		return this._schoolOptionsSubject;
	}

}
