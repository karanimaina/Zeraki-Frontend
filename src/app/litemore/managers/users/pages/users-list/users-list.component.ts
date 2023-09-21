import { Component, OnInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { InternalViewsUser } from "src/app/@core/models/litemore/users/internal-views-user";
import { RetrieveInternalViewsUsersFilters } from "src/app/@core/models/litemore/users/payloads";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import UsersListState from "src/app/@core/services/litemore/states/users-list-state";
import { APIStatus } from "src/app/@core/enums/api-status";
import Swal from "sweetalert2";
import { PageInfo } from "src/app/@core/models/common/pagination";
import { RetrieveRegionsFilters } from "src/app/@core/models/region/payload";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";

@Component({
	selector: "app-users-list",
	templateUrl: "./users-list.component.html",
	styleUrls: ["./users-list.component.scss"]
})
export class UsersListComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	getSchoolsDataStatus$: Observable<APIStatus | null> = this.usersListState.getUsersListStatus$;

	users: InternalViewsUser[] = [];
	pageInfo?: PageInfo;

	dataSource: MatTableDataSource<InternalViewsUser> = new MatTableDataSource();

	searchForm = this.fb.group({
		searchTerm: [""],
	});
	get searchTerm(): AbstractControl | null {
		return this.searchForm.get("searchTerm");
	}

	constructor(
		private litemoreService: LitemoreService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private fb: FormBuilder,
		private usersListState: UsersListState,
		private regionsState: RegionsState,
		private regionCountiesState: RegionCountiesState,
		private currentCountryState: CurrentCountryState,
	) { }

	ngOnInit(): void {
		this.subscribeToUsersList();
		this.subscribeToCurrentCountry();
		this.fetchCounties();
	}

	private fetchCounties() {
		this.regionCountiesState.retrieveRegionCounties({
			countryId: this.currentCountryState.currentCountryId,
			download: true,
		});
	}

	private subscribeToUsersList() {
		this.usersListState.usersList$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (usersData) => {
				if (usersData) {
					this.pageInfo = usersData.pageInfo;
					this.dataSource = new MatTableDataSource(usersData.profiles);
				}

			},
			error: () => {
				this.toastService.error(this.translate.instant("litemore.managers.users.pages.usersList.failedToDeleteUser"));
			},
		});
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (currentCountry) => {
				if (currentCountry)	{
					this.getRegions(currentCountry.countryId);
					this.fetchCounties();
					this.fetchUsers();
				}
			}
		});
	}

	private getRegions(countryId?: number) {
		const filters: RetrieveRegionsFilters = {
			countryId,
			currentPage: 1,
			download: true, // to retrieve all regions without pagination restrictions
		};

		this.regionsState.retrieveRegions(filters);
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		// const searchTerm = this.searchForm.value["searchTerm"];
		this.fetchUsers();
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.fetchUsers();
	}

	private fetchUsers(page = 1, download = false) {
		const filters: RetrieveInternalViewsUsersFilters = {
			countryId: this.currentCountryState.currentCountryId,
			currentPage: page,
			download,
			name: this.searchTerm?.value,
		};

		this.usersListState.retrieveUsersList(filters);
	}

	async confirmUserDeletion(user: InternalViewsUser, index: number) {
		const text = this.translate.instant("litemore.managers.users.pages.usersList.deleteUserSwal.text",{
			user:user.email
		});
		const title = this.translate.instant("litemore.managers.users.pages.usersList.deleteUserSwal.title");


		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("litemore.managers.users.pages.usersList.deleteUserSwal.yes"),
			cancelButtonText: this.translate.instant("litemore.managers.users.pages.usersList.deleteUserSwal.no"),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false,
		});

		if (result.isConfirmed) {
			this.deleteUser(user, index);
		}
	}

	private deleteUser(user: InternalViewsUser, index: number) {
		this.litemoreService.deleteUser(user.userId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.dataSource.filteredData.splice(index, 1);
				this.toastService.success(res.response.message);
			},
			error: (error: any) => {
				console.error(error);
				this.toastService.error(this.translate.instant("litemore.managers.users.pages.usersList.failedToDeleteUser"));
			}
		});
	}

	clearCache() {
		this.litemoreService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
			next: () => {
				const msg = this.translate.instant("common.toastMessages.cacheCleared");
				this.toastService.success(msg);
			},
			error: () => {
				const msg = this.translate.instant("common.toastMessages.cacheClearedError");
				this.toastService.error(msg);
			}
		});
	}

	onPageChanged(page: number) {
		this.fetchUsers(page);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
