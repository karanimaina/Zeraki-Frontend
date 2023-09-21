import { Injectable } from "@angular/core";
import { InvoiceService } from "../invoice/invoice.service";
import CountryDetailsState from "./country-details.state";
import CountryDivisionsState from "./country-divisions.state";
import CountryProfilesState from "./country-profiles.state";
import CurrentCountryState from "./current-country.state";
import EducationSystemsState from "./education-system.state";
import FormMappingsState from "./form-mappings.state";
import RegionCountiesState from "./region-counties.state";
import RegionsState from "./regions.state";
import RolesState from "./roles.state";
import { SchoolsDataState } from "./schools-data.state";
import SchoolsTypeState from "./schools-type.state";
import SubCountiesState from "./sub-county.state";
import UsersListState from "./users-list-state";

@Injectable({
	providedIn: "root"
})
export class StateResetsService {
	constructor(
		private usersListState: UsersListState,
		private schoolsTypeState: SchoolsTypeState,
		private schoolsDataState: SchoolsDataState,
		private rolesState: RolesState,
		private regionsState: RegionsState,
		private regionCountiesState: RegionCountiesState,
		private subCountiesState: SubCountiesState,
		private currentCountryState: CurrentCountryState,
		private countryProfilesState: CountryProfilesState,
		private countryDivisionsState: CountryDivisionsState,
		private countryDetailsState: CountryDetailsState,
		private educationSystemsState: EducationSystemsState,
		private formMappingsState: FormMappingsState,
		private invoiceService: InvoiceService
	) {}

	resetAllStateData() {
		this.usersListState.resetState();
		this.schoolsTypeState.resetState();
		this.schoolsDataState.resetState();
		this.rolesState.resetState();
		this.regionsState.resetState();
		this.regionCountiesState.resetState();
		this.subCountiesState.resetState();
		this.currentCountryState.resetState();
		this.countryProfilesState.resetState();
		this.countryDivisionsState.resetState();
		this.countryDetailsState.resetState();
		this.educationSystemsState.resetState();
		this.formMappingsState.resetState();
		this.invoiceService.clearCache();
	}
}
