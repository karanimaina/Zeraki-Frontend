import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
	AfterViewInit
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
	RetrieveInternalSchoolsPayload,
	UpdateSchoolPayload
} from "src/app/@core/models/litemore/school/payload";
import { SchoolDataItem } from "src/app/@core/models/litemore/school/school-data";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { SchoolsDataState } from "src/app/@core/services/litemore/states/schools-data.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import Swal from "sweetalert2";
import * as moment from "moment";
import { ZerakiPartner } from "src/app/@core/models/litemore/zeraki-partner/zeraki-partner";
import { ZerakiAccountManager } from "src/app/@core/models/litemore/zeraki-account-manager/zeraki-account-manager";
import { LitemoreSchoolData } from "src/app/@core/models/litemore/school/litemore-school-data";
import { SchoolValidityStatus } from "src/app/@core/enums/litemore/school-validity-status";
import { ExcelTemplateHeader } from "src/app/@core/models/excel/excel-template-header";
import {
	ActionText,
	SchoolDataItemAction
} from "src/app/@core/models/litemore/school/school-data-action";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import { SchoolTypeMappingService } from "src/app/@core/services/litemore/mapping/school-type-mapping.service";
import { CountryService } from "src/app/@core/shared/services/country/country.service";
import { ExcelService } from "src/app/@core/shared/services/excel/excel.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { Location } from "@angular/common";
import SchoolsTypeState from "src/app/@core/services/litemore/states/schools-type.state";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { County } from "src/app/@core/models/country/county/county";
import { SubCounty } from "src/app/@core/models/country/county/subcounty";
import CountryDetailsState from "../../../../@core/services/litemore/states/country-details.state";

@Component({
	templateUrl: "./schools-type.component.html",
	styleUrls: ["./schools-type.component.scss"]
})
export class SchoolsTypeComponent implements OnInit, OnDestroy, AfterViewInit {
	readonly LitemoreUserRole = LitemoreUserRole;
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	partners$: BehaviorSubject<ZerakiPartner[]> = this.litemoreService.partners;
	accountManagers$: BehaviorSubject<ZerakiAccountManager[]> =
		this.litemoreService.account_managers;

	getSchoolsDataStatus$ = this.schoolsDataState.getSchoolDataStatus$;
	getSchoolsDataMessage$ = this.schoolsDataState.getSchoolDataMessage$;
	schoolsData$ = this.schoolsDataState.schoolsData$;
	schoolsTypes$ = this.schoolsTypeState.schoolsTypes$;

	counties$ = this.regionCountiesState.regionCounties$;
	counties: Array<County> = [];

	editable: { [key: number]: boolean } = [];
	countySubCountiesMap: Map<string, Array<SubCounty>> = new Map();

	schoolsData: LitemoreSchoolData | null = null;
	dataSource: MatTableDataSource<SchoolDataItem> = new MatTableDataSource();

	product!: string;

	schoolTypeFilter?: string;
	schoolTypeFilters?: Array<string>;

	tableHeaders: Array<{ key: string; text: string }> = [];
	tableActionItems: Partial<SchoolDataItemAction> = {};

	countryDetails: any;
	regionalLevels:Array<string> = [];
	schoolOwnerShipTypes:Array<string> = [];

	get allTableHeaders(): Array<{ key: string; text: string }> {
		return [...this.tableHeadersDefault, ...this.tableHeaders];
	}

	schoolNameFilter?: string;
	regionFilter?: number;
	countyFilter?: number;
	subCountyFilter?: number;
	ownershipTypeFilter?: string;
	schoolLevelFilter?: string;
	setupStageFilter?: string;
	educationSystemFilter?: number;
	startDateFilter?: string;
	endDateFilter?: string;

	isGeneratingExcel = false;

	updateSenderIdModalForm = false;

	get actionTableColumnAccess(): { roles: LitemoreUserRole[] } {
		return {
			roles: [
				LitemoreUserRole.SUPER_ADMIN,
				LitemoreUserRole.TECH_SUPPORT,
				LitemoreUserRole.LITEMORE_ADMIN,
				LitemoreUserRole.BDEV_MANAGER
			]
		};
	}

	get bdevTableColumnAccess(): { roles: LitemoreUserRole[] } {
		return {
			roles: [
				LitemoreUserRole.BDEV
			]
		};
	}

	@ViewChild("closeSenderIdModal")
		closeSenderIdModal?: ElementRef<HTMLButtonElement>;
	@ViewChild("changeSenderIdModal")
		changeSenderIdModal?: ElementRef<HTMLDivElement>;

	constructor(
		private activatedRoute: ActivatedRoute,
		private litemoreService: LitemoreService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private countryService: CountryService,
		private schoolsDataState: SchoolsDataState,
		private schoolTypeMappingService: SchoolTypeMappingService,
		private currentCountryState: CurrentCountryState,
		private schoolsTypeState: SchoolsTypeState,
		private regionCountiesState: RegionCountiesState,
		private responseHandler: ResponseHandlerService,
		private countryDetailsState: CountryDetailsState,
		private location: Location
	) {
		// when location change...
		// close modals...
		this.location.subscribe((location) => {
			// ...close popup
			this.closeSenderIdModal?.nativeElement.click();
		});
	}

	ngOnDestroy(): void {
		this.removeEventListeners();
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.subscribeToSchoolTypes();
		this.getSchoolsData();
		this.subscribeToCounties();
		this.subscribeToCurrentCountry();
		this.getRegionalLevels();
		this.getSchoolOwnerShipType();
	}

	ngAfterViewInit(): void {
		this.addEventListeners();
	}


	getRegionalLevels() {
		this.litemoreService.getSchoolRegionalLevels().subscribe((levels:Array<string>)=>{
			this.regionalLevels = levels;
		});
	}
	getSchoolOwnerShipType() {
		this.litemoreService.getSchoolOwnerShipType().subscribe((ownerShipType:Array<string>)=>{
			this.schoolOwnerShipTypes = ownerShipType;
		});
	}
	private addEventListeners() {
		this.changeSenderIdModal?.nativeElement?.addEventListener(
			"shown.bs.modal",
			() => {
				this.updateSenderIdModalForm = false;
			}
		);

		this.changeSenderIdModal?.nativeElement?.addEventListener(
			"hidden.bs.modal",
			() => {
				this.updateSenderIdModalForm = true;
			}
		);
	}

	private removeEventListeners() {
		this.changeSenderIdModal?.nativeElement?.removeEventListener(
			"shown.bs.modal",
			() => {
				this.updateSenderIdModalForm = false;
			}
		);

		this.changeSenderIdModal?.nativeElement?.removeEventListener(
			"hidden.bs.modal",
			() => {
				this.updateSenderIdModalForm = true;
			}
		);
	}

	get tableHeadersDefault(): Array<{ key: string; text: string }> {
		return [
			{
				key: "name",
				text: this.translate.instant("common.name")
			},
			{
				key: "registrationCode",
				text: this.translate.instant("litemore.registrationCode")
			}
		];
	}

	get schoolType(): string | null | undefined {
		if (this.product === "Analytics") {
			return this.schoolTypeFilter || this.product;
		}

		return this.product;
	}

	testfiltersSubject$: Subject<boolean> = new Subject();
	private subscribeToSchoolTypes() {
		this.schoolsTypes$.pipe(takeUntil(this.testfiltersSubject$)).subscribe({
			next: (schoolTypes) => {
				if (schoolTypes) {
					this.testfiltersSubject$.next(true);

					this.schoolTypeFilters = schoolTypes?.schoolTypes;
					this.schoolTypeFilter = schoolTypes?.schoolTypes[0];

					this.setSchoolsData();
				}
			}
		});
	}

	private setSchoolsData() {
		this.activatedRoute.paramMap
			.pipe(takeUntil(this.destroy$))
			.subscribe((params) => {

				this.product = params.get("product")!;

				this.getSchools();
			});
	}

	private getSchoolsData() {
		this.schoolsData$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (schoolsData) => {
				this.schoolsData = schoolsData;

				if (schoolsData) {
					const schools = this.schoolTypeMappingService.mapSchoolTypes(
						schoolsData,
						this.schoolType
					);
					if (this.schoolsData) this.schoolsData.schools = schools;
				}

				this.dataSource = new MatTableDataSource<SchoolDataItem>(
					this.schoolsData?.schools
				);

				if (this.dataSource.filteredData.length > 0) {
					this.tableHeaders = this.dataSource.filteredData[0].tableHeaders();
					this.tableActionItems = this.dataSource.filteredData[0].actions();
				}
			}
		});
	}

	get isExcelDownloadBtnDisabled(): boolean {
		return (
			this.isGeneratingExcel || this.dataSource?.filteredData?.length === 0
		);
	}

	private subscribeToCounties() {
		this.counties$.subscribe((counties) => {
			this.counties = counties?.counties || [];
		});
	}

	getSchools(page = 1, download = false) {
		const payload: RetrieveInternalSchoolsPayload = {
			countryId: this.currentCountryState.getCurrentCountry()?.countryId,
			product: this.product,
			currentPage: page,
			schoolName: this.schoolNameFilter,
			regionId: this.regionFilter,
			countyId: this.countyFilter,
			subCountyId: this.subCountyFilter,
			schoolRegionalLevel: this.schoolLevelFilter,
			schoolOwnershipType: this.ownershipTypeFilter,
			educationSystemId: this.educationSystemFilter,
			setupStage: this.setupStageFilter,
			startDate: this.startDateFilter,
			endDate: this.endDateFilter,
			download
		};

		if (this.product == "Analytics") {
			payload.schoolType = this.schoolTypeFilter;
		}

		if (download) {
			this.getAllSchools(payload);
			return;
		}

		this.schoolsDataState.getSchoolsData(payload);
	}

	getAllSchools(payload: RetrieveInternalSchoolsPayload) {
		this.isGeneratingExcel = true;

		this.litemoreService.getSchools(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (schoolsData) => {
				let schools:SchoolDataItem[] = [];

				if (schoolsData) {
					schools = this.schoolTypeMappingService.mapSchoolTypes(
						schoolsData,
						this.schoolType
					);
				}

				this.generateExcelData(schools);
			}
		});
	}

	private async generateExcelData(schools: SchoolDataItem[]) {
		this.isGeneratingExcel = true;

		const formattedDate = moment().format("MMMM Do YYYY, h:mm a");
		const fileName = `${this.schoolType} Schools in ${this.countryService.currentCountry?.name} (as at ${formattedDate}`;
		const workSheetName = this.translate.instant(
			"litemore.zlCreds.excelDownload.workSheetName"
		);

		const entries: any[] = [];
		const colHeaderWidths = this.allTableHeaders.map(
			(header) => header.text.length
		);

		for (const school of schools) {
			const schoolRow: any[] = [];

			this.allTableHeaders.forEach((tableHeader, index) => {
				let currentSchoolValue = school[tableHeader.key];
				const currentHeaderWidth = currentSchoolValue?.toString().length;

				if (currentHeaderWidth > colHeaderWidths[index]) {
					colHeaderWidths[index] = currentHeaderWidth;
				}

				if (
					typeof currentSchoolValue === "string" &&
					currentSchoolValue.includes("<br>")
				) {
					currentSchoolValue = currentSchoolValue.replace("<br>", " - ");
				}
				schoolRow.push(currentSchoolValue);
			});

			entries.push(schoolRow);
		}

		const sheetHeaders: ExcelTemplateHeader[] = this.allTableHeaders.map(
			(sheetHeader, index) => {
				const displayValue =
					this.isStudentColumnHeader(sheetHeader)
						? this.translate.instant("litemore.schools.studentPopulation")
							.toString().toUpperCase()
						: this.isTeacherColumnHeader(sheetHeader)
							? this.translate.instant("litemore.schools.teacherPopulation")
								.toString().toUpperCase()
							:"";
				return {
					key: sheetHeader.text.toUpperCase(),
					value: sheetHeader.text.toUpperCase(),
					width: colHeaderWidths[index] + 2,
					originalKey:sheetHeader.key,
					displayValue:displayValue
				};
			}
		);

		this.downloadExcelFile(fileName, workSheetName, sheetHeaders, entries);

		this.isGeneratingExcel = false;
	}

	clearCache() {
		this.litemoreService
			.clearCache()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					const msg = this.translate.instant(
						"common.toastMessages.cacheCleared"
					);
					this.toastService.success(msg);
				},
				error: () => {
					const msg = this.translate.instant(
						"common.toastMessages.cacheClearedError"
					);
					this.toastService.error(msg);
				}
			});
	}

	onPageChanged(page: number) {
		this.getSchools(page);
	}

	async modifySchoolStatus(
		school: SchoolDataItem,
		schoolType?: string,
		validityStatus?: SchoolValidityStatus
	) {
		let title = "";
		let article = "";
		let text = "";

		if (schoolType) {
			title = this.translate.instant(
				"litemore.managers.schools.schoolsType.modifySchoolStatus.title",
				{ action: schoolType }
			);
			article =
				["a", "e", "i", "o", "u"].indexOf(schoolType.charAt(0)) === -1
					? " a "
					: " an ";
			text = this.translate.instant(
				"litemore.managers.schools.schoolsType.modifySchoolStatus.text",
				{ school: school.name + article + schoolType }
			);
		}

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.managers.schools.schoolsType.modifySchoolStatus.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.managers.schools.schoolsType.modifySchoolStatus.no"
			),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49"
		});

		if (result.isConfirmed) {
			const payload: UpdateSchoolPayload = {
				schoolId: school.schoolId,
				validityStatus
			};

			this.litemoreService
				.updateSchoolValidityStatus(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						this.removeSchoolFromList(school.schoolId);
						this.responseHandler.success(resp);
					},
					error: (err: any) => {
						this.responseHandler.error(err, "modifySchoolStatus()");
					}
				});
		}
	}

	school?: SchoolDataItem;

	initializeEdit(key: string, school: SchoolDataItem, status = false) {
		switch (key) {
		case "senderId":
			this.school = school;
			break;

		default:
			break;
		}
	}

	onSenderIdUpdateSuccess(updatedSenderId: string) {
		this.school!.senderId = updatedSenderId;
	}

	closeDialog() {
		this.closeSenderIdModal?.nativeElement.click();
	}

	initiatRegistrationCodeEdit(school: SchoolDataItem, status = false) {
		school.registrationCodeEdit = status;
		if (status) school.registrationCodeTemp = school.registrationCode;
	}

	initSchoolRegionalLevelEdit(school: SchoolDataItem, status = false) {
		school.schoolRegionalLevelEdit = status;
		if (status) school.schoolRegionalLevelTemp = school.schoolRegionalLevel;

	}

	initEducationSystemEdit(school: SchoolDataItem, status = false) {
		school.educationSystemEdit = status;
		this.getCountryDetails();
		if (status) school.educationSystemTemp = school.educationSystem;
	}

	initSchoolOwnershipTypeEdit(school: SchoolDataItem, status = false) {
		school.schoolOwnershipTypeEdit = status;
		if (status) school.schoolOwnershipTypeTemp = school.schoolOwnershipType;
	}

	initializeCountyEdit(school: SchoolDataItem, status = false) {
		school.countyEdit = status;
		if (status) school.countyTemp = school.county;
	}

	initializeSubCountyEdit(school: SchoolDataItem, status = false) {
		school.subCountyEdit = status;
		if (status) school.subCountyTemp = school.subCountyName;
		this.findSubCountyByName(school);
	}

	initializeZerakiPartnerEdit(school: SchoolDataItem, status = false) {
		school.zerakiPartnerEdit = status;
		if (status)
			school.zerakiPartnerTemp = {
				name: school.zerakiPartner?.split("<br>")?.[0]
			};
	}

	initializeAccountManagerEdit(school: SchoolDataItem, status = false) {
		school.accountManagerEdit = status;
		if (status) school.accountManagerTemp = school.accountManager;
	}

	initializeAccountOwnerEdit(school: SchoolDataItem, status = false) {
		school.accountOwnerEdit = status;
		if (status) school.accountOwnerTemp = school.accountOwner;
	}

	updateSchoolRegistrationCode(school: SchoolDataItem) {
		const newSchoolRegCode = school.registrationCodeTemp;

		this.litemoreService
			.updateSchoolRegistrationCode(school.schoolId, newSchoolRegCode)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					school.registrationCode = newSchoolRegCode;
					school.registrationCodeEdit = false;
					this.toastService.success(resp?.response?.message);
				},
				error: (err: any) => {
					this.responseHandler.error(err, "updateSchoolRegistrationCode()");
				}
			});
	}

	private getCountryDetails() {
		this.countryDetailsState.countryDetails$.subscribe((state: any) => {
			this.countryDetails = state;
		});
	}

	updateSchoolRegionalLevel(school: SchoolDataItem) {
		const payload: UpdateSchoolPayload = {schoolId: school.schoolId, removeAccountOwner:false};
		if (school.schoolRegionalLevelTemp) {
			payload.schoolRegionalLevel = school.schoolRegionalLevelTemp;
			this.litemoreService
				.updateSchool(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						school.schoolRegionalLevel = school.schoolRegionalLevelTemp;
						school.schoolRegionalLevelEdit = false;
					},
					error: (err: any) => {
						this.responseHandler.error(err, "updateSchoolCounty()");
					}
				});
		}
	}

	updateEducationSystem(school: SchoolDataItem) {
		const payload: UpdateSchoolPayload = {schoolId: school.schoolId, removeAccountOwner:false};
		if (school.educationSystemTemp && school.educationSystemTemp.educationSystemId) {
			payload.educationSystemId = Number(school.educationSystemTemp.educationSystemId);
			this.litemoreService
				.updateSchool(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						school.educationSystem = school.educationSystemTemp.name;
						school.educationSystemEdit = false;
					},
					error: (err: any) => {
						this.responseHandler.error(err, "updateSchoolCounty()");
					}
				});
		}
	}

	updateSchoolOwnershipType(school: SchoolDataItem) {
		const payload: UpdateSchoolPayload = {schoolId: school.schoolId};
		if (school.schoolOwnershipTypeTemp) {
			payload.schoolOwnershipType = school.schoolOwnershipTypeTemp;
			this.litemoreService
				.updateSchool(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						school.schoolOwnershipType = school.schoolOwnershipTypeTemp;
						school.schoolOwnershipTypeEdit = false;
					},
					error: (err: any) => {
						this.responseHandler.error(err, "updateSchoolCounty()");
					}
				});
		}
	}

	updateSchoolCounty(school: SchoolDataItem) {
		let newCountyName = "";
		const payload: UpdateSchoolPayload = {schoolId: school.schoolId};

		if (school.countyTemp && school.countyTemp.countyId) {
			payload.countyId = parseInt(school.countyTemp.countyId);
			newCountyName = school.countyTemp.name;

			this.litemoreService
				.updateSchoolCounty(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						school.county = newCountyName;
						school.countyEdit = false;
						school.subCountyName = "";

						if (this.countyFilter && payload.countyId !== this.countyFilter)
							this.removeSchoolFromList(school.schoolId);

						this.responseHandler.success(resp);
						this.initializeSubCountyEdit(school, true);
					},
					error: (err: any) => {
						this.responseHandler.error(err, "updateSchoolCounty()");
					}
				});
		}
	}

	updateSchoolSubCounty(school: SchoolDataItem) {
		let newSubCountyName = "";
		const payload: UpdateSchoolPayload = {schoolId: school.schoolId};

		if (school.subCountyTemp && school.subCountyTemp.subCountyId) {
			payload.subCountyId = parseInt(school.subCountyTemp.subCountyId);
			newSubCountyName = school.subCountyTemp.subCountyName;

			this.litemoreService
				.updateSchoolCounty(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						school.subCountyName = newSubCountyName;
						school.subCountyEdit = false;

						if (
							this.subCountyFilter &&
							payload.subCountyId !== this.subCountyFilter
						)
							this.removeSchoolFromList(school.schoolId);

						this.responseHandler.success(resp);
					},
					error: (err: any) => {
						this.responseHandler.error(err, "updateSchoolCounty()");
					}
				});
		}
	}

	updateSchoolPartner(school: SchoolDataItem, removePartner: boolean) {
		let newPartnerName = "";
		const payload: UpdateSchoolPayload = {
			schoolId: school.schoolId,
			removePartner
		};

		if (
			!removePartner &&
			school.zerakiPartnerTemp &&
			school.zerakiPartnerTemp.partnerid
		) {
			payload.zerakiPartnerId = parseInt(school.zerakiPartnerTemp.partnerid);
			newPartnerName = `${school.zerakiPartnerTemp.name}<br>${school.zerakiPartnerTemp.email}`;
		}

		this.litemoreService
			.updateSchoolPartner(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					school.zerakiPartner = newPartnerName;
					school.zerakiPartnerEdit = false;
					this.toastService.success(resp?.response?.message);
				},
				error: (err) => {
					this.responseHandler.error(err, "updateSchoolPartner()");
				}
			});
	}

	updateSchoolAccountManager(
		school: SchoolDataItem,
		removeAccountManager: boolean
	) {
		let newAccountManagerName = "";
		const payload: UpdateSchoolPayload = {
			schoolId: school.schoolId,
			removeAccountManager
		};

		if (
			!removeAccountManager &&
			school.accountManagerTemp &&
			school.accountManagerTemp.managerid
		) {
			payload.accountManagerId = parseInt(school.accountManagerTemp.managerid);
			newAccountManagerName = school.accountManagerTemp.name;
		}

		this.litemoreService
			.updateSchoolAccountManager(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					school.accountManager = newAccountManagerName;
					school.accountManagerEdit = false;
					this.toastService.success(resp.response?.message);
				},
				error: (err: any) => {
					this.responseHandler.error(err, "updateSchoolAccountManager()");
				}
			});
	}

	updateSchoolAccountOwner(
		school: SchoolDataItem,
		removeAccountOwner: boolean
	) {
		let newAccountownerName = "";
		const data: UpdateSchoolPayload = {
			schoolId: school.schoolId,
			removeAccountOwner
		};

		if (
			!removeAccountOwner &&
			school.accountOwnerTemp &&
			school.accountOwnerTemp.managerid
		) {
			data.accountOwnerId = parseInt(school.accountOwnerTemp.managerid);
			newAccountownerName = school.accountOwnerTemp.name;
		}

		this.litemoreService
			.updateSchoolAccountOwner(data)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					school.accountOwner = newAccountownerName;
					school.accountOwnerEdit = false;
					this.toastService.success(resp?.response?.message);
				},
				error: (err: any) => {
					this.responseHandler.error(err, "updateSchoolAccountOwner()");
				}
			});
	}

	async takeSchoolVerificationAction(
		school: SchoolDataItem,
		verificationAction: ActionText
	) {
		const title = this.translate.instant(
			"litemore.managers.schools.schoolsType.schoolVerification.title",
			{action: verificationAction}
		);
		const text = this.translate.instant(
			"litemore.managers.schools.schoolsType.schoolVerification.text",
			{action: verificationAction.toLowerCase() + " " + school.name}
		);

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.managers.schools.schoolsType.schoolVerification.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.managers.schools.schoolsType.schoolVerification.no"
			),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49"
		});

		if (result.isConfirmed) {
			if (verificationAction === "Verify") {
				this.verifySchool(school.schoolId);
			} else if (verificationAction === "Reject") {
				this.rejectSchool(school.schoolId);
			}
		}
	}

	private async verifySchool(schoolId: number) {
		this.litemoreService
			.verifySchool(schoolId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.removeSchoolFromList(schoolId);
					this.toastService.success(
						this.translate.instant(
							"litemore.managers.schools.schoolsType.schoolVerifiedSuccessfully"
						)
					);
				},
				error: (err: any) => {
					this.responseHandler.error(err, "verifySchool()");
				}
			});
	}

	private async rejectSchool(schoolId: number) {
		this.litemoreService
			.deleteSchool(schoolId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.removeSchoolFromList(schoolId);
					this.toastService.success(
						this.translate.instant(
							"litemore.managers.schools.schoolsType.schoolRejectedSuccessfully"
						)
					);
				},
				error: (err: any) => {
					this.responseHandler.error(err, "rejectSchool()");
				}
			});
	}

	trackByIndex(index: number): number {
		return index;
	}

	retrieveSchoolsForDownload() {
		this.getSchools(0, true);
	}

	private downloadExcelFile(
		fileName: string,
		workSheetName: string,
		sheetHeaders: ExcelTemplateHeader[],
		entries: any[],

	) {
		const excelService = new ExcelService(
			fileName,
			workSheetName,
			sheetHeaders,
			entries,
		);
		excelService.downloadSchoolsExcelTemplate();
	}

	private removeSchoolFromList(schoolId: number) {
		const foundSchoolIndex = this.dataSource.filteredData.findIndex(
			(school) => school.schoolId === schoolId
		);
		if (foundSchoolIndex !== -1)
			this.dataSource.filteredData.splice(foundSchoolIndex, 1);
	}

	setSchoolNameFilter(schoolName?: string) {
		this.schoolNameFilter = schoolName;
	}

	setRegionFilter(regionId?: number) {
		this.regionFilter = regionId;
	}

	setCountyFilter(countyId?: number) {
		this.countyFilter = countyId;
	}

	setSubCountyFilter(subCountyId?: number) {
		this.subCountyFilter = subCountyId;
	}

	setOwnershipTypeFilter(ownership?: string) {
		this.ownershipTypeFilter = ownership;
	}

	setSchoolLevelFilter(schoolLevel?: string) {
		this.schoolLevelFilter = schoolLevel;
	}

	setSetupStageFilter(setupStage?: string) {
		this.setupStageFilter = setupStage;
	}

	setEducationSystemFilter(educationSystemId?: number) {
		this.educationSystemFilter = educationSystemId;
	}

	setStartDateFilter(startDate?: string) {
		this.startDateFilter = startDate;
	}

	setEndDateFilter(endDate?: string) {
		this.endDateFilter = endDate;
	}

	setSchoolTypeFilter(schoolTypeFilter?: string) {
		this.schoolTypeFilter = schoolTypeFilter;
		this.getSchools();
	}

	editSchool(school: SchoolDataItem) {
		this.editable[school.schoolId] = true;
	}

	cancelEdit(school: SchoolDataItem) {
		this.editable[school.schoolId] = !this.editable[school.schoolId];
	}

	findSubCountyByName(school: SchoolDataItem) {
		school.subCountyTemp = null;
		const currentCounty = this.counties.find(
			({name}) => name == school.county
		);
		if (currentCounty) {
			if (this.countySubCountiesMap.get(school.county!) == null) {
				this.getSubCounties(currentCounty);
			}
		}
	}

	getSubCounties(county: County) {
		this.countryService
			.getSubCounties({
				countyId: county.countyId,
				download: true
			})
			.subscribe((subcounties: any) => {
				this.countySubCountiesMap.set(county.name, subcounties?.subCounties);
			});
	}


	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (currentCountry) => {
					if (currentCountry) {
						this.getSchools();
					}
				}
			});
	}

	shouldMergeColumnHeaderCells(tableHeader):boolean {
		return [
			"teachers","femaleTeacherCount","maleTeacherCount",
			"students","boysStudentCount","girlsStudentCount"
		].indexOf(tableHeader.key) ===-1;
	}

	isTeacherColumnHeader(tableHeader):boolean {
		return [
			"teachers",
		].indexOf(tableHeader.key) !==-1;
	}
	isStudentColumnHeader(tableHeader): boolean {
		return [
			"students"
		].indexOf(tableHeader.key) !==-1;
	}
}
