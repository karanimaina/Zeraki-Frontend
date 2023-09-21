import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RetrieveSubCountyFilters } from "src/app/@core/models/country/county/payload";
import { environment } from "src/environments/environment";
import { CountryProfile } from "../../../models/country/country-profile";

@Injectable({
	providedIn: "root"
})
export class CountryService {
	private readonly localStorageCountryKey = "country";

	private localStorageCountry = localStorage.getItem(
		this.localStorageCountryKey
	);
	private countryProfile: CountryProfile | null = this.localStorageCountry
		? <CountryProfile>JSON.parse(this.localStorageCountry)
		: null;
	apiUrl = environment.apiurl;

	constructor(private http: HttpClient) {}

	get currentCountry(): CountryProfile | null {
		return this.countryProfile;
	}

	changeCountry(country: CountryProfile): void {
		localStorage.setItem(this.localStorageCountryKey, JSON.stringify(country));
		this.updateCountryProfile();
	}

	private updateCountryProfile() {
		this.countryProfile = <CountryProfile>(
			JSON.parse(<string>localStorage.getItem(this.localStorageCountryKey))
		);
	}

	getCountry(): Observable<any> {
		return this.http.get(`${this.apiUrl}/country`);
	}

	getCounties(countryId = 1): Observable<any> {
		return this.http.get(
			`${this.apiUrl}/country/details?countryId=${countryId}`
		);
	}

	getSubCounties({
		countyId,
		download,
		name,
		currentPage = 1
	}: RetrieveSubCountyFilters) {
		let url = `${this.apiUrl}/groups/subCounty?currentPage=${currentPage}`;
		if (countyId) url += `&countyId=${countyId}`;

		if (name) url += `&name=${name}`;
		if (download) url += `&download=${download}`;

		return this.http.get(url);
	}

	removeCountry() {
		localStorage.removeItem(this.localStorageCountryKey);
	}
}
