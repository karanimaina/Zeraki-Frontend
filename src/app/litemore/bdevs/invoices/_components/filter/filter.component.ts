import {
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output
} from "@angular/core";
import { FormArray, FormControl } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import {
	BdevManagersFilters,
	RegManagerFilters,
	RelManagerFilters
} from "src/app/@core/enums/filter-fields";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { County } from "src/app/@core/models/country/county/county";
import { RetrieveRegionCountyFilters } from "src/app/@core/models/country/county/payload";
import { InternalViewsUser } from "src/app/@core/models/litemore/users/internal-views-user";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { RetrieveInternalViewsUsersFilters } from "src/app/@core/models/litemore/users/payloads";
import { RetrieveRegionsFilters } from "src/app/@core/models/region/payload";
import { Region } from "src/app/@core/models/region/region";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import SchoolsTypeState from "src/app/@core/services/litemore/states/schools-type.state";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-filter",
	templateUrl: "./filter.component.html",
	styleUrls: ["./filter.component.scss"]
})
export class FilterComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;

	destroy$: Subject<boolean> = new Subject<boolean>();
	loggedInUser?: LitemoreUser1;
	urlParams = "";
	countyList: any[] = [];
	relationshipManagers: any = [];

	getRegionCountiesStatus$ = this.regionCountiesState.getRegionCountiesStatus$;
	counties: County[] = [];

	isLoadingBdevs = false;
	bdevs: InternalViewsUser[] = [];

	isLoadingRegions = false;
	regions: Region[] = [];

	getSchoolsTypesStatus$ = this.schoolsTypeState.getSchoolsTypesStatus$;
	zerakiProducts: string[] = [];

	@Output() OloadSchoolList: EventEmitter<any> = new EventEmitter();
	@Output() ORegionalCountyList: EventEmitter<Array<any>> = new EventEmitter();
	@Output() OCountyList: EventEmitter<Array<any>> = new EventEmitter();
	@Output() OFilterForm: EventEmitter<SubmitFormGroup> = new EventEmitter();

	filterForm!: SubmitFormGroup;
	filters: Array<{ name: string; value: string }> = [];

	invoiceRange: Array<{ name: string; value: string }> = [
		{
			name: this.translate.instant(
				"litemore.bdevs.invoices.components.filter.invoiceRange.allRanges"
			),
			value: "all_ranges"
		},
		{
			name: this.translate.instant(
				"litemore.bdevs.invoices.components.filter.invoiceRange.zeroToFifteenDays"
			),
			value: "0_15"
		},
		{
			name: this.translate.instant(
				"litemore.bdevs.invoices.components.filter.invoiceRange.fifteenToFortyFiveDays"
			),
			value: "15_45"
		},
		{
			name: this.translate.instant(
				"litemore.bdevs.invoices.components.filter.invoiceRange.fortyFivePlusDays"
			),
			value: "45_"
		},
		{
			name: this.translate.instant(
				"litemore.bdevs.invoices.components.filter.invoiceRange.overdueDays"
			),
			value: "overdue"
		}
	];

	constructor(
		private litemoreUserService: LitemoreUserService,
		private litemoreService: LitemoreService,
		private regionCountiesState: RegionCountiesState,
		private schoolsTypeState: SchoolsTypeState,
		private responseHandlerService: ResponseHandlerService,
		private translate: TranslateService
	) {}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.subscribeToSchoolTypes();
		this.subscribeToCounties();

		this.loadLoggedInUser();
		this.initializeForm();
	}

	private subscribeToSchoolTypes() {
		this.schoolsTypeState.schoolsTypes$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (litemoreSchoolTypes) => {
					if (litemoreSchoolTypes)
						this.zerakiProducts = litemoreSchoolTypes.zerakiProducts;
				}
			});
	}

	private subscribeToCounties() {
		this.regionCountiesState.regionCounties$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (regionCountyData) => {
					if (regionCountyData) {
						this.counties = regionCountyData?.counties;
						this.ORegionalCountyList.emit(this.counties);
					}
				}
			});
	}

	private loadLoggedInUser() {
		this.litemoreUserService.litemoreUser$
			.pipe(takeUntil(this.destroy$))
			.subscribe((resp) => {
				if (resp) {
					this.loggedInUser = this.litemoreUserService.initLitemoreUser(resp);
					this.initializeFiltersByRole();
					this.loadAllCounties();
					this.urlParams = "";

					/** Load Relationship Manager Schools */
					if (this.loggedInUser.isBdev && !this.loggedInUser.isBdevManager) {
						this.urlParams = `&relationshipManagerId=${this.loggedInUser?.userId}`;
					}

					this.OFilterForm.emit(this.filterForm);
					this.OloadSchoolList.emit(this.urlParams);

					if (
						this.loggedInUser.isLitemoreAdmin ||
						this.loggedInUser.isBdevManager
					) {
						this.fetchRegions(this.loggedInUser?.countryId || 1);
					}
				}
			});
	}

	initializeFiltersByRole() {
		if (this.loggedInUser?.isBdev) {
			this.filters = RelManagerFilters;
		}
		if (this.loggedInUser?.isLitemoreAdmin) {
			this.filters = RegManagerFilters;
		}
		if (
			this.loggedInUser?.isBdevManager ||
			this.loggedInUser?.isFinance ||
			this.loggedInUser?.isCx
		) {
			this.filters = BdevManagersFilters;
		}
	}

	loadAllCounties() {
		this.litemoreService
			.getRegionCounties({ countryId: this.loggedInUser?.countryId || 1 })
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (regionCountyData) => {
					this.countyList = regionCountyData.counties;

					this.ORegionalCountyList.emit(this.countyList);
					this.OCountyList.emit(this.countyList);
				},
				error: (err) => {
					this.responseHandlerService.error(err, "loadAllCounties()");
				}
			});
	}

	private fetchRegions(countryId: number) {
		this.isLoadingRegions = true;

		const filters: RetrieveRegionsFilters = {
			download: true,
			countryId
		};

		this.litemoreService
			.getRegions(filters)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoadingRegions = false))
			)
			.subscribe({
				next: (regionsData) => {
					if (regionsData) this.regions = regionsData.regions;
					const currentRegion =
						this.regions.find(
							(region) => region.regionId === this.loggedInUser?.regionId
						) || this.regions[0];
					this.selectedRegion?.setValue(currentRegion);
					this.onRegionChange(currentRegion);
				},
				error: (err: any) => {
					this.responseHandlerService.error(err, "fetchRegions()");
				}
			});
	}

	compareRegions(item: Region, selected: Region) {
		return item.regionId === selected.regionId;
	}

	private fetchCounties(regionId: number) {
		const filters: RetrieveRegionCountyFilters = {
			download: true,
			regionId
		};

		this.regionCountiesState.retrieveRegionCounties(filters);
	}

	private fetchBdevs(regionId: number) {
		this.isLoadingBdevs = true;

		const filters: RetrieveInternalViewsUsersFilters = {
			download: true,
			regionId,
			role: LitemoreUserRole.BDEV
		};

		this.litemoreService
			.getUsers(filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (litemoreUserData) => {
					if (litemoreUserData) this.bdevs = litemoreUserData.profiles;
				},
				error: (err: any) => {
					this.responseHandlerService.error(err, "fetchBdevs()");
				},
				complete: () => (this.isLoadingBdevs = false)
			});
	}

	initializeForm() {
		this.filterForm = new SubmitFormGroup({
			checkArray: new FormArray([]),
			selectedRegion: new FormControl(null),
			selectedCounty: new FormControl(null),
			selectedSchoolName: new FormControl(null),
			selectedProformaDayRange: new FormControl("all_ranges"),
			selectedInvoiceDayRange: new FormControl("all_ranges"),
			selectedRelationshipManager: new FormControl(null),
			selectedProduct: new FormControl(null),
			startDate: new FormControl(""),
			endDate: new FormControl("")
		});

		this.addDefaultFilters();
	}

	get checkArray() {
		return this.filterForm.get("checkArray") as FormArray;
	}
	get selectedRegion() {
		return this.filterForm.get("selectedRegion");
	}
	get selectedCounty() {
		return this.filterForm.get("selectedCounty");
	}
	get selectedSchoolName() {
		return this.filterForm.get("selectedSchoolName");
	}
	get selectedProformaDayRange() {
		return this.filterForm.get("selectedProformaDayRange");
	}
	get selectedInvoiceDayRange() {
		return this.filterForm.get("selectedInvoiceDayRange");
	}
	get selectedRelationshipManager() {
		return this.filterForm.get("selectedRelationshipManager");
	}
	get selectedProduct() {
		return this.filterForm.get("selectedProduct");
	}
	get startDate() {
		return this.filterForm.get("startDate");
	}
	get endDate() {
		return this.filterForm.get("endDate");
	}

	private addDefaultFilters() {
		const checkArray: FormArray = this.filterForm.get(
			"checkArray"
		) as FormArray;
		checkArray.push(new FormControl("schoolName"));
	}

	onRegionChange(region: Region) {
		if (!region) {
			this.counties = [];
			this.selectedCounty?.reset();

			this.bdevs = [];
			this.selectedRelationshipManager?.reset();
		} else {
			this.fetchCounties(region.regionId);
			this.fetchBdevs(region.regionId);
		}
	}

	onCheckboxChange(e: any) {
		const checkArray: FormArray = this.filterForm.get(
			"checkArray"
		) as FormArray;
		if (e.target.checked) {
			checkArray.push(new FormControl(e.target.value));
		} else {
			let i = 0;
			checkArray.controls.forEach((item) => {
				if (item.value == e.target.value) {
					checkArray.removeAt(i);
					return;
				}
				i++;
			});
		}
	}

	schoolProformaSearch() {
		this.addParams();
		this.OFilterForm.emit(this.filterForm);
	}

	addParams() {
		let params = "";

		if (
			this.loggedInUser?.isBdev &&
			!this.loggedInUser.isBdevManager &&
			!this.loggedInUser?.isCx &&
			!this.loggedInUser.isLitemoreAdmin &&
			!this.loggedInUser?.isFinance
		) {
			params = "&relationshipManagerId=" + this.loggedInUser?.userId;
		}

		if (
			this.filterForm.value.checkArray.includes("counties") &&
			this.selectedCounty?.value
		) {
			params += "&countyId=" + this.selectedCounty?.value;
		}

		if (
			this.filterForm.value.checkArray.includes("region") &&
			this.selectedRegion?.value
		) {
			params += "&regionId=" + this.selectedRegion?.value;
		}

		if (
			this.filterForm.value.checkArray.includes("relationshipManager") &&
			this.selectedRelationshipManager?.value
		) {
			params +=
				"&relationshipManagerId=" + this.selectedRelationshipManager?.value;
		}

		if (
			this.filterForm.value.checkArray.includes("schoolName") &&
			this.selectedSchoolName?.value
		) {
			params += "&name=" + this.selectedSchoolName?.value;
		}

		if (!this.filterForm.value.checkArray.includes("withProformaInvoices")) {
			params += "&proformaDateRange=" + this.selectedProformaDayRange?.value;
		}

		if (!this.filterForm.value.checkArray.includes("withInvoices")) {
			params += "&dateRange=" + this.selectedInvoiceDayRange?.value;
		}
		if (
			this.filterForm.value.checkArray.includes("product") &&
			this.selectedProduct?.value
		) {
			params += "&product=" + this.selectedProduct?.value;

			this.startDate?.value
				? (params += "&startDate=" + this.startDate?.value)
				: "";
			this.endDate?.value ? (params += "&endDate=" + this.endDate?.value) : "";
		}

		params +=
			"&withoutProformas=" +
			this.filterForm.value.checkArray.includes("withProformaInvoices");
		params +=
			"&withoutInvoices=" +
			this.filterForm.value.checkArray.includes("withInvoices");

		this.urlParams = params;
		this.OloadSchoolList.emit(this.urlParams);
	}
}
