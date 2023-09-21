import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	Output,
	EventEmitter
} from "@angular/core";
import { FormArray, FormControl } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SuperAdminManagerFilters } from "src/app/@core/enums/filter-fields";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { CountryEducationSystemItem } from "src/app/@core/models/litemore/country-details/education-system";
import { RetrieveInternalSchoolsPayload } from "src/app/@core/models/litemore/school/payload";
import { Region } from "src/app/@core/models/region/region";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import CountryDetailsState from "src/app/@core/services/litemore/states/country-details.state";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import { SchoolsDataState } from "src/app/@core/services/litemore/states/schools-data.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import { CountryService } from "src/app/@core/shared/services/country/country.service";
import { RetrieveRegionsFilters } from "src/app/@core/models/region/payload";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import { County } from "src/app/@core/models/country/county/county";
import { SubCounty } from "src/app/@core/models/country/county/subcounty";
import SubCountiesState from "src/app/@core/services/litemore/states/sub-county.state";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-schools-filters",
	templateUrl: "./schools-filters.component.html",
	styleUrls: ["./schools-filters.component.scss"]
})
export class SchoolsFiltersComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;

	@Input() product!: string;
	@Input() activeSchoolType?: string;
	@Input() schoolTypeFilters?: string[] = [];

	@Output() schoolNameEvent = new EventEmitter<string>();
	@Output() regionIdEvent = new EventEmitter<number>();
	@Output() countyIdEvent = new EventEmitter<number>();

	@Output() subCountyIdEvent = new EventEmitter<number>();
	@Output() schoolLevelEvent = new EventEmitter<string>();
	@Output() ownershipTypeEvent = new EventEmitter<string>();

	@Output() setupStageEvent = new EventEmitter<string>();
	@Output() educationSystemIdEvent = new EventEmitter<number>();
	@Output() startDateEvent = new EventEmitter<string>();
	@Output() endDateEvent = new EventEmitter<string>();
	@Output() schoolTypeEvent = new EventEmitter<string>();

	destroy$: Subject<boolean> = new Subject<boolean>();

	getCountryDetailsStatus$ = this.countryDetailsState.getCountryDetailsStatus$;
	countryDetails$ = this.countryDetailsState.countryDetails$;

	getRegionsStatus$ = this.regionsState.getRegionsStatus$;
	regions$ = this.regionsState.regions$;

	getRegionCountiesStatus$ = this.regionCountiesState.getRegionCountiesStatus$;
	getSubCountiesStatus$ = this.subCountiesState.getSubCountiesStatus$;

	regions: Region[] = [];
	counties: County[] = [];
	educationSystems: CountryEducationSystemItem[] = [];
	setupStages: string[] = [];

	filters: Array<{ name: string; value: string }> = [
		...SuperAdminManagerFilters
	];

	isLoadingRegionalCounties = false;
	filterForm!: SubmitFormGroup;

	subCounties?: Array<SubCounty>;
	ownershipTypes: Array<{ name: string; value: string }> = [];
	regionalLevel: Array<{ name: string; value: string }> = [];

	constructor(
		private litemoreService: LitemoreService,
		private countryService: CountryService,
		private schoolsDataState: SchoolsDataState,
		private countryDetailsState: CountryDetailsState,
		private currentCountryState: CurrentCountryState,
		private regionCountiesState: RegionCountiesState,
		private subCountiesState: SubCountiesState,
		private regionsState: RegionsState,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService
	) {}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.initializeForm();
		this.getSchoolSetupStages();

		this.countryDetailsState.retrieveCountryDetails(
			<number>this.currentCountry?.countryId
		);

		this.subscribeToCurrentCountry();
		this.subscribeToCountryDetails();
		this.subscribeToRegions();
		this.subscribeToCounties();
		this.subscribeToSubCounties();

		this.setOwnershipTypes();
		this.setRegionalLevels();
	}

	initializeForm() {
		this.filterForm = new SubmitFormGroup({
			checkArray: new FormArray([]),
			schoolName: new FormControl(null),
			selectedRegion: new FormControl(""),
			selectedCounty: new FormControl(""),
			selectedEducationSystem: new FormControl(""),
			selectedSetupStage: new FormControl(""),
			startDate: new FormControl(""),
			endDate: new FormControl(""),
			selectedSubcounty: new FormControl(""),
			schoolOwnershipType: new FormControl(""),
			schoolRegionalLevel: new FormControl("")
		});
		this.addDefaultFilters();
	}

	addDefaultFilters() {
		const checkArray: FormArray = this.filterForm.get(
			"checkArray"
		) as FormArray;
		checkArray.push(new FormControl("schoolName"));
		checkArray.push(new FormControl("region"));
		checkArray.push(new FormControl("county"));
	}

	private subscribeToCountryDetails() {
		this.countryDetails$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (countryDetails) => {
				this.selectedCounty?.reset();
				this.selectedEducationSystem?.reset();

				if (countryDetails)
					this.educationSystems =
						countryDetails.countryEducationSystems.educationSystems;
			}
		});
	}

	private subscribeToRegions() {
		this.regions$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionsData) => {
				this.selectedRegion?.reset();
				if (regionsData) this.regions = regionsData.regions;
			},
			error: (error) => {
				this.responseHandler.error(error, "subscribeToRegions()");
			}
		});
	}

	private subscribeToCounties() {
		this.regionCountiesState.regionCounties$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (regionCountiesData) => {
					this.counties = regionCountiesData?.counties || [];
				}
			});
	}

	private subscribeToSubCounties() {
		this.subCountiesState.subCounties$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (subCounties) => {
					this.subCounties = subCounties || [];
				}
			});
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (currentCountry) => {
					if (currentCountry) this.getRegions(currentCountry.countryId);
				}
			});
	}

	private getRegions(countryId?: number) {
		const filters: RetrieveRegionsFilters = {
			countryId,
			currentPage: 1,
			download: true // to retrieve all regions without pagination restrictions
		};

		this.regionsState.retrieveRegions(filters);
	}

	get currentCountry(): CountryProfile | null {
		return this.countryService.currentCountry;
	}

	get displaySearchBtn(): boolean {
		return this.checkArray.length > 0;
	}

	get checkArray() {
		return this.filterForm.get("checkArray") as FormArray;
	}
	get schoolName() {
		return this.filterForm.get("schoolName");
	}
	get selectedRegion() {
		return this.filterForm.get("selectedRegion");
	}
	get selectedCounty() {
		return this.filterForm.get("selectedCounty");
	}
	get selectedEducationSystem() {
		return this.filterForm.get("selectedEducationSystem");
	}
	get selectedSetupStage() {
		return this.filterForm.get("selectedSetupStage");
	}
	get startDate() {
		return this.filterForm.get("startDate");
	}
	get endDate() {
		return this.filterForm.get("endDate");
	}
	get selectedSubcounty() {
		return this.filterForm.get("selectedSubcounty");
	}
	get schoolOwnershipType() {
		return this.filterForm.get("schoolOwnershipType");
	}
	get schoolRegionalLevel() {
		return this.filterForm.get("schoolRegionalLevel");
	}

	private getSchoolSetupStages() {
		this.litemoreService
			.getSchoolSetupStages()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (setupStages) => (this.setupStages = setupStages),
				error: (err: any) => {
					this.responseHandler.error(err, "getSchoolSetupStages()");
				}
			});
	}

	onFilterCheckboxChange(event: any) {
		const checkArray: FormArray = this.filterForm.get(
			"checkArray"
		) as FormArray;
		if (event.target.checked) {
			checkArray.push(new FormControl(event.target.value));
		} else {
			checkArray.controls.forEach((fieldAbstractControl, index) => {
				if (fieldAbstractControl.value == event.target.value) {
					checkArray.removeAt(index);
					return;
				}
			});
		}
	}

	onSchoolNameChange(event: any) {
		this.schoolNameEvent.emit(event.target.value);
	}

	onRegionChange(region?: Region) {
		this.selectedCounty?.reset();
		this.counties = [];
		this.countyIdEvent.emit();

		if (region) {
			this.fetchCounties(region.regionId);
		} else {
			this.fetchCounties();
		}

		this.regionIdEvent.emit(region?.regionId);
	}

	private fetchCounties(regionId?: number) {
		const params: any = {
			countryId: this.currentCountryState.currentCountryId,
			download: true
		};
		if (regionId) params.regionId = regionId;
		this.regionCountiesState.retrieveRegionCounties(params);
	}

	onCountyChange(county?: County) {
		this.selectedSubcounty?.reset();
		this.subCounties = [];
		this.subCountyIdEvent.emit();

		if (county) {
			this.getSubCounties(county.countyId);
		} else {
			this.getSubCounties();
		}

		this.countyIdEvent.emit(county?.countyId);
	}

	getSubCounties(countyId?: number) {
		const params: any = {
			countyId: countyId
		};
		this.subCountiesState.retrieveSubCounties(params);
	}

	onSubCountyChange(subcounty: SubCounty) {
		this.subCountyIdEvent.emit(subcounty?.subCountyId);
	}

	onRegionalLevelChange(schoolLevel: any) {
		this.schoolLevelEvent.emit(schoolLevel);
	}

	onOwnershipTypeChange(ownership: any) {
		this.ownershipTypeEvent.emit(ownership);
	}

	onSetupStageChange(setupStage?: string) {
		this.setupStageEvent.emit(setupStage);
	}

	onEducationSystemChange(educationSystem?: CountryEducationSystemItem) {
		this.educationSystemIdEvent.emit(educationSystem?.educationSystemId);
	}

	onStartDateChange(event: any) {
		this.startDateEvent.emit(event.target.value);
	}

	onEndDateChange(event: any) {
		this.endDateEvent.emit(event.target.value);
	}

	resetSearchFilter() {
		this.schoolName?.reset();
		this.getSchools();
	}

	onFilterFormSubmit() {
		this.getSchools();
	}

	private isFilterFieldVisible(key: string): boolean {
		return this.filterForm.value.checkArray.includes(key);
	}

	private getSchools() {
		const payload: RetrieveInternalSchoolsPayload = {
			currentPage: 1,
			countryId: this.currentCountry?.countryId,
			countyId: this.isFilterFieldVisible("county")
				? this.selectedCounty?.value
				: null,
			subCountyId: this.isFilterFieldVisible("subcounty")
				? this.selectedSubcounty?.value
				: null,
			schoolRegionalLevel: this.isFilterFieldVisible("schoolRegionalLevel")
				? this.schoolRegionalLevel?.value
				: null,
			schoolOwnershipType: this.isFilterFieldVisible("schoolOwnershipType")
				? this.schoolOwnershipType?.value
				: null,
			schoolName: this.isFilterFieldVisible("schoolName")
				? this.schoolName?.value
				: null,
			product: this.product,
			schoolType: this.activeSchoolType,
			regionId: this.isFilterFieldVisible("region")
				? this.selectedRegion?.value
				: null,
			setupStage: this.isFilterFieldVisible("setupStage")
				? this.selectedSetupStage?.value
				: null,
			educationSystemId: this.isFilterFieldVisible("educationSystem")
				? this.selectedEducationSystem?.value
				: null,
			startDate: this.isFilterFieldVisible("startDate")
				? this.startDate?.value
				: null,
			endDate: this.isFilterFieldVisible("endDate") ? this.endDate?.value : null
		};

		this.schoolsDataState.getSchoolsData(payload);
	}

	changeActiveSchoolType(schoolType: string) {
		if (schoolType !== this.activeSchoolType) {
			this.activeSchoolType = schoolType;
			this.schoolTypeEvent.emit(schoolType);
		}
	}

	setOwnershipTypes() {
		this.translate
			.get([
				"settings.schoolInfoProfile.ownershipType.public",
				"settings.schoolInfoProfile.ownershipType.private"
			])
			.subscribe((translations) => {
				this.ownershipTypes = [
					{
						name: translations[
							"settings.schoolInfoProfile.ownershipType.public"
						],
						value: "Public"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.ownershipType.private"
						],
						value: "Private"
					}
				];
			});
	}

	setRegionalLevels() {
		this.translate
			.get([
				"settings.schoolInfoProfile.regionalLevel.national",
				"settings.schoolInfoProfile.regionalLevel.extraCounty",
				"settings.schoolInfoProfile.regionalLevel.county",
				"settings.schoolInfoProfile.regionalLevel.subCounty"
			])
			.subscribe((translations) => {
				this.regionalLevel = [
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.national"
						],
						value: "national"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.extraCounty"
						],
						value: "extra-county"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.county"
						],
						value: "county"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.subCounty"
						],
						value: "sub-county"
					}
				];
			});
	}
}
