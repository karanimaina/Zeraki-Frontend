import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CountryProfile } from "../../models/country/country-profile";
import {
	AddCountryProfilePayload,
	UpdateCountryProfilePayload
} from "../../models/country/payload";
import { LitemoreSchoolTypes } from "../../models/litemore-schools";
import { CountryDetails } from "../../models/litemore/country-details/country-details";
import { CountryEducationSystem } from "../../models/litemore/country-details/education-system";
import {
	AddRegionCountyPayload,
	RetrieveRegionCountyFilters,
	UpdateRegionCountyPayload
} from "../../models/country/county/payload";
import { CountyData } from "../../models/country/county/county";
import {
	AddEducationSystemPayload,
	RetrieveEducationSystemFilters,
	UpdateEducationSystemPayload
} from "../../models/litemore/education-system/payload";
import { FormMapping } from "../../models/litemore/form-mapping/form-mapping";
import {
	AddFormMappingPayload,
	RetrieveFormMappingFilters,
	UpdateFormMappingPayload
} from "../../models/litemore/form-mapping/payload";
import { LitemoreSchoolData } from "../../models/litemore/school/litemore-school-data";
import {
	RetrieveInternalSchoolsPayload,
	UpdateSchoolPayload
} from "../../models/litemore/school/payload";
import { LitemoreUsersData } from "../../models/litemore/users/internal-views-user";
import {
	AddInternalViewsUserPayload,
	RetrieveInternalViewsUsersFilters,
	UpdateInternalViewsUserPayload
} from "../../models/litemore/users/payloads";
import { ZerakiAccountManager } from "../../models/litemore/zeraki-account-manager/zeraki-account-manager";
import { ZerakiPartner } from "../../models/litemore/zeraki-partner/zeraki-partner";
import { ZerakiProductSchool } from "../../models/litemore/zeraki-products/zeraki-product-school";
import {
	AddRegionPayload,
	RetrieveRegionsFilters,
	UpdateRegionPayload
} from "../../models/region/payload";
import { RegionsData } from "../../models/region/region";

@Injectable({
	providedIn: "root"
})
export class LitemoreService {
	constructor(private http: HttpClient) {}

	// public schoolsObj: BehaviorSubject<any> = new BehaviorSubject(null);
	public partners = new BehaviorSubject<ZerakiPartner[]>([]);
	public account_managers = new BehaviorSubject<ZerakiAccountManager[]>([]);
	public unverifiedSchools: BehaviorSubject<any> = new BehaviorSubject(null);

	getRegions({
		countryId,
		currentPage = 1,
		download = false,
		name
	}: RetrieveRegionsFilters) {
		let url = `${environment.apiurl}/region?currentPage=${currentPage}`;

		if (countryId) url += `&countryId=${countryId}`;
		if (name) url += `&name=${name}`;
		if (download) url += `&download=${download}`;

		return this.http.get<RegionsData>(url);
	}

	addRegion(payload: AddRegionPayload) {
		return this.http.post(`${environment.apiurl}/region`, payload);
	}

	updateRegion(payload: UpdateRegionPayload) {
		return this.http.put(`${environment.apiurl}/region`, payload);
	}

	deleteRegion(regionId: number) {
		return this.http.delete(
			`${environment.apiurl}/region?regionId=${regionId}`
		);
	}

	getRegionalCounties(regionId: number) {
		return this.http.get<CountyData>(
			`${environment.apiurl}/county/region?regionId=${regionId}`
		);
	}

	getRegionCounties({
		countryId,
		regionId,
		download,
		name,
		currentPage = 1
	}: RetrieveRegionCountyFilters) {
		let url = `${environment.apiurl}/county?currentPage=${currentPage}`;
		if (countryId) url += `&countryId=${countryId}`;

		if (regionId)
			url = `${environment.apiurl}/county/region?currentPage=${currentPage}&regionId=${regionId}`;

		if (name) url += `&name=${name}`;
		if (download) url += `&download=${download}`;

		return this.http.get<CountyData>(url);
	}

	addCounty(payload: AddRegionCountyPayload) {
		return this.http.post(`${environment.apiurl}/county`, payload);
	}

	updateRegionCounty(payload: UpdateRegionCountyPayload) {
		return this.http.put(`${environment.apiurl}/county`, payload);
	}

	deleteCounty(countyId: number) {
		return this.http.delete(
			`${environment.apiurl}/county?countyId=${countyId}`
		);
	}

	getCountryDetails(countryId: number) {
		return this.http.get<CountryDetails>(
			`${environment.apiurl}/country/details?countryId=${countryId}`
		);
	}

	getCountryById(countryId: number) {
		return this.http.get<CountryDetails>(
			`${environment.apiurl}/country?countryId=${countryId}`
		);
	}

	getCountryProfiles(name?: string) {
		let url = `${environment.apiurl}/country`;

		if (name) url += `?name=${name}`;

		return this.http.get<CountryProfile[]>(url);
	}

	addCountryProfile(payload: AddCountryProfilePayload) {
		return this.http.post(`${environment.apiurl}/country`, payload);
	}

	updateCountryProfile(payload: UpdateCountryProfilePayload) {
		return this.http.put(`${environment.apiurl}/country`, payload);
	}

	deleteCountryProfile(countryId: number) {
		return this.http.delete(
			`${environment.apiurl}/country?countryId=${countryId}`
		);
	}

	addEducationSystem(payload: AddEducationSystemPayload) {
		return this.http.post(`${environment.apiurl}/educationSystem`, payload);
	}

	getEducationSystems({ countryId }: RetrieveEducationSystemFilters) {
		return this.http.get<CountryEducationSystem>(
			`${environment.apiurl}/educationSystem?countryId=${countryId}`
		);
	}

	updateEducationSystem(
		payload: AddEducationSystemPayload | UpdateEducationSystemPayload,
		isNewRecord = false
	) {
		if (isNewRecord)
			return this.addEducationSystem(<AddEducationSystemPayload>payload);
		return this.http.put(
			`${environment.apiurl}/educationSystem/edit`,
			<UpdateEducationSystemPayload>payload
		);
	}

	deleteEducationSystem(educationSystemId: number) {
		return this.http.delete(
			`${environment.apiurl}/educationSystem?educationSystemId=${educationSystemId}`
		);
	}

	addFormMapping(payload: AddFormMappingPayload) {
		return this.http.post(`${environment.apiurl}/forms/mappings`, payload);
	}

	getFormMappings({ educationSystemId }: RetrieveFormMappingFilters) {
		let url = `${environment.apiurl}/forms/mappings`;
		if (educationSystemId) url += `?educationSystemId=${educationSystemId}`;
		return this.http.get<FormMapping>(url);
	}

	updateFormMapping(payload: UpdateFormMappingPayload) {
		return this.http.put(
			`${environment.apiurl}/forms/mappings/edit`,
			<UpdateFormMappingPayload>payload
		);
	}

	deleteFormMapping(educationSystemId: number) {
		return this.http.delete(
			`${environment.apiurl}/forms/mappings?educationSystemId=${educationSystemId}`
		);
	}

	getSchoolSetupStages() {
		return this.http.get<string[]>(
			`${environment.apiurl}/internal/schools/setupStage`
		);
	}

	getSchoolsType() {
		return this.http.get<LitemoreSchoolTypes>(
			`${environment.apiurl}/internal/schools/type`
		);
	}

	getSchoolRegionalLevels() {
		return this.http.get<string[]>(
			`${environment.apiurl}/internal/schools/regional-level`
		);
	}

	getSchoolOwnerShipType() {
		return this.http.get<string[]>(
			`${environment.apiurl}/internal/schools/ownership-type`
		);
	}

	getSchools({
		regionId,
		countryId,
		countyId,
		subCountyId,
		schoolRegionalLevel,
		schoolOwnershipType,
		product,
		schoolType,
		schoolName,
		educationSystemId,
		setupStage,
		startDate,
		endDate,
		download,
		currentPage = 1
	}: RetrieveInternalSchoolsPayload) {
		let url = `${environment.apiurl}/internal/schools?currentPage=${currentPage}`;

		if (countryId) url += `&countryId=${countryId}`;
		if (countyId) url += `&countyId=${countyId}`;
		if (subCountyId) url += `&subCountyId=${subCountyId}`;
		if (schoolRegionalLevel) url += `&schoolLevel=${schoolRegionalLevel}`;
		if (schoolOwnershipType) url += `&ownershipType=${schoolOwnershipType}`;
		if (regionId) url += `&regionId=${regionId}`;
		if (educationSystemId) url += `&educationSystemId=${educationSystemId}`;
		if (product) url += `&product=${product}`;
		if (schoolType) url += `&schoolType=${schoolType}`;
		if (schoolName) url += `&schoolName=${schoolName}`;
		if (setupStage) url += `&setupStage=${setupStage}`;
		if (startDate) url += `&startDate=${startDate}`;
		if (endDate) url += `&endDate=${endDate}`;
		if (download) url += `&download=${download}`;

		return this.http.get<LitemoreSchoolData>(url);
	}

	updateSchoolRegistrationCode(schoolId: number, registrationCode: string) {
		return this.http.put(
			`${environment.apiurl}/school/registration-code?schoolId=${schoolId}&registrationCode=${registrationCode}`,
			null
		);
	}

	updateSchoolValidityStatus(payload: UpdateSchoolPayload) {
		return this.http.put(
			`${environment.apiurl}/groups/school/validate`,
			payload
		);
	}

	updateSchoolPartner(payload: UpdateSchoolPayload) {
		return this.http.put(
			`${environment.apiurl}/groups/school/zerakipartner`,
			payload
		);
	}

	updateSchoolCounty(payload: UpdateSchoolPayload) {
		return this.http.put(`${environment.apiurl}/groups/school/county`, payload);
	}

	updateSchoolAccountManager(payload: UpdateSchoolPayload) {
		return this.http.put(
			`${environment.apiurl}/groups/school/accountmanager`,
			payload
		);
	}

	updateSchoolAccountOwner(payload: UpdateSchoolPayload) {
		return this.http.put(
			`${environment.apiurl}/groups/school/accountowner`,
			payload
		);
	}
	updateSchool(payload: any) {
		return this.http.put(
			`${environment.apiurl}/internal/schools`,
			payload
		);
	}

	updateSchoolContactPerson(payload: UpdateSchoolPayload) {
		return this.http.put(`${environment.apiurl}/groups/school/county`, payload);
	}

	getUsers({
		regionId,
		countyId,
		role,
		name,
		countryId,
		download,
		currentPage = 1
	}: RetrieveInternalViewsUsersFilters) {
		let url = `${environment.apiurl}/internal/user?currentPage=${currentPage}`;

		if (regionId) url += `&regionId=${regionId}`;
		if (countyId) url += `&countyId=${countyId}`;
		if (role) url += `&role=${role}`;
		if (name) url += `&name=${name}`;
		if (countryId) url += `&countryId=${countryId}`;
		if (download) url += `&download=${download}`;

		return this.http.get<LitemoreUsersData>(url);
	}

	addUser(payload: AddInternalViewsUserPayload) {
		return this.http.post(`${environment.apiurl}/internal/user`, payload);
	}

	updateUser(payload: UpdateInternalViewsUserPayload) {
		return this.http.put(`${environment.apiurl}/internal/user`, payload);
	}

	deleteUser(userId: number) {
		return this.http.delete(
			`${environment.apiurl}/internal/user?userId=${userId}`
		);
	}

	getVerifiedSchools() {
		return this.http.get(`${environment.apiurl}/groups/school/verified`);
	}

	getUnverifiedSchools() {
		return this.http.get(`${environment.apiurl}/groups/school/unverified`);
	}

	getVerifiedSchoolsWithParams(params: any) {
		return this.http.get(
			`${environment.apiurl}/groups/school/verified${params}`
		);
	}

	searchVerifiedSchools(params: any) {
		return this.http.get(
			`${environment.apiurl}/groups/school/verified${params}`
		);
	}

	verifySchool(schoolID: number) {
		return this.http.put(
			`${environment.apiurl}/groups/school/verify/${schoolID}`,
			{}
		);
	}

	deleteSchool(schoolID: number) {
		return this.http.delete(
			`${environment.apiurl}/groups/school/unverified/${schoolID}`
		);
	}

	clearCache() {
		return this.http.get(`${environment.apiurl}/groups/clearcache`);
	}

	getZerakiPartners() {
		return this.http.get<ZerakiPartner[]>(
			`${environment.apiurl}/groups/zerakipartners`
		);
	}

	getZerakiAccountManagers() {
		return this.http.get(`${environment.apiurl}/groups/zerakiaccountmanagers`);
	}

	getZerakiPartners_Requests() {
		return this.http.get<any[]>(
			`${environment.apiurl}/groups/zerakipartners/request`
		);
	}

	getFeedback() {
		return this.http.get(`${environment.apiurl}/groups/feedback`);
	}

	getZlearningCredentials(params: any) {
		return this.http.get(`${environment.apiurl}/groups/zl/school${params}`);
	}

	getZerakiShopPayments(params: any) {
		return this.http.get(`${environment.apiurl}/shop/payment${params}`);
	}

	getZerakiProducts(name: any): Observable<ZerakiProductSchool[]> {
		return this.http.get<ZerakiProductSchool[]>(
			`${environment.apiurl}/products/school?name=${name}`
		);
	}

	updateZerakiProducts(payload: any) {
		return this.http.put(`${environment.apiurl}/products`, payload);
	}

	getFaqs() {
		return this.http.get(`${environment.apiurl}/test/fa_qs`);
	}

	getFaqCategories() {
		return this.http.get(`${environment.apiurl}/test/faqcategories`);
	}

	getFaqCategory(categoryID: number) {
		return this.http.get(
			`${environment.apiurl}/test/faqcategory/${categoryID}`
		);
	}

	addFaqCategories(categories: string[]) {
		return this.http.post(
			`${environment.apiurl}/test/faqcategories`,
			categories
		);
	}

	deleteFaqCategory(categoryID: number) {
		return this.http.delete(
			`${environment.apiurl}/test/faqcategory/${categoryID}`
		);
	}

	deleteFaq(faqID: number) {
		return this.http.delete(`${environment.apiurl}/test/faq/${faqID}`);
	}

	addFaq(categoryID: number, data: any) {
		return this.http.post(
			`${environment.apiurl}/test/faqcategory/${categoryID}`,
			data
		);
	}

	getVerifiedSelfSignUpSchools() {
		return this.http.get(`${environment.apiurl}/groups/school/verifiedss`);
	}

	getUnverifiedSelfSignUpSchools() {
		return this.http.get(`${environment.apiurl}/groups/school/unverifiedss`);
	}

	getCounties() {
		return this.http.get(`${environment.apiurl}/groups/counties`);
	}

	getSchoolTypes() {
		return this.http.get(`${environment.apiurl}/groups/schooltypes`);
	}

	getGenderTypes() {
		return this.http.get(`${environment.apiurl}/groups/gendertypes`);
	}

	rejectSchool(schoolID: number) {
		return this.http.delete(
			`${environment.apiurl}/groups/ss_school/reject/${schoolID}`
		);
	}

	verifySelfSignUpSchool(schoolID: number) {
		return this.http.put(
			`${environment.apiurl}/groups/school/verifyss/${schoolID}`,
			{}
		);
	}

	invalidateUnverifiedSelfSignUpSchool(schoolID: number) {
		return this.http.post(
			`${environment.apiurl}/groups/ss_school/invalidate/${schoolID}`,
			{}
		);
	}

	register_ss_School(payload: any, population: any) {
		return this.http.post(
			`${environment.apiurl}/groups/ss_school?sms_no_determinant=${population.category}`,
			payload
		);
	}

	searchResetCode(payload: any) {
		return this.http.post(`${environment.apiurl}/users/am_reset_code`, payload);
	}

	getAccountManagerSchools(schoolId?: number) {
		let params = "";
		if (schoolId && schoolId > 0) {
			params = "?schoolid=" + schoolId;
		}

		return this.http.get(
			`${environment.apiurl}/groups/school/accountmanager${params}`
		);
	}

	getSMSSchools(searchTerm: string) {
		return this.http.get(
			`${environment.apiurl}/groups/school/search?name=${searchTerm}`
		);
	}

	updateSchoolSMS(schoolID: number, smsSizeToAdd: number) {
		return this.http.post(
			`${environment.apiurl}/groups/school/sms/update?schoolid=${schoolID}&sms=${smsSizeToAdd}`,
			{}
		);
	}

	getCountryDivisions(countryId: number) {
		return this.http.get<string[]>(
			`${environment.apiurl}/country/divisions?countryId=${countryId}`
		);
	}

	getInternalViewsRoles() {
		return this.http.get<string[]>(`${environment.apiurl}/internal/user/role`);
	}

	testSenderId(payload: { senderId: string; phoneNumber: string }) {
		return this.http.post(`${environment.apiurl}/school/sender-id`, payload);
	}

	addSenderId(payload: {
		senderId: string;
		phoneNumber: string;
		schoolId?: number;
	}) {
		return this.http.put(`${environment.apiurl}/school/sender-id`, payload);
	}
}
