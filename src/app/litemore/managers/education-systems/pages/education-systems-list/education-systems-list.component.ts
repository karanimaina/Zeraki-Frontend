import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { PageInfo } from "jspdf";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { CountryEducationSystemItem } from "src/app/@core/models/litemore/country-details/education-system";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import EducationSystemsState from "src/app/@core/services/litemore/states/education-system.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";
import {TranslateService} from "@ngx-translate/core";

@Component({
	templateUrl: "./education-systems-list.component.html",
	styleUrls: ["./education-systems-list.component.scss"]
})
export class EducationSystemsListComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$ = new Subject<boolean>();

	educationSystems$ = this.eductionSystemState.educationSystems$;
	getEducationSystemsStatus$ = this.eductionSystemState.getEducationSystemsStatus$;
	dataSource: MatTableDataSource<CountryEducationSystemItem> = new MatTableDataSource();
	pageInfo?: PageInfo;

	searchForm = this.fb.group({
		searchTerm: [""],
	});
	get searchTerm(): AbstractControl | null {
		return this.searchForm.get("searchTerm");
	}

	constructor(
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private fb: FormBuilder,
		private eductionSystemState: EducationSystemsState,
		private currentCountryState: CurrentCountryState,
		private translate:TranslateService
	) { }

	ngOnInit(): void {
		this.subscribeToCurrentCountry();
		this.subscribeToEducationSystems();
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (currentCountry) => {
				if (currentCountry)	this.fetchEducationSystems(currentCountry.countryId);
			},
		});
	}

	private fetchEducationSystems(countryId?: number) {
		this.eductionSystemState.retrieveEducationSystems({
			countryId,
			name: this.searchTerm?.value,
		});
	}

	private subscribeToEducationSystems() {
		this.educationSystems$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (response) => {
				this.dataSource = new MatTableDataSource(response?.educationSystems);
			}
		});
	}

	clearCache() {
		this.litemoreService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.responseHandler.success(resp, "clearCache()");
			},
			error: (err) => this.responseHandler.error(err, "clearCache()"),
		});
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		this.fetchEducationSystems(this.currentCountryState.currentCountryId);
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.fetchEducationSystems(this.currentCountryState.currentCountryId);
	}

	onEducationSystemUpdateSuccess({ shouldResetSearchForm }: { shouldResetSearchForm: boolean }) {
		if (shouldResetSearchForm)	this.resetSearchForm();
		this.fetchEducationSystems(this.currentCountryState.currentCountryId);
	}

	async confirmEducationSystemDeletion(educationSystemItem: CountryEducationSystemItem, index: number) {
		const title = this.translate.instant('litemore.managers.educationSystems.pages.educationSystemsList.deleteSwal.title');
		const text = this.translate.instant('litemore.managers.educationSystems.pages.educationSystemsList.deleteSwal.text',{name:educationSystemItem.name});

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant('litemore.managers.educationSystems.pages.educationSystemsList.deleteSwal.yes'),
			cancelButtonText: this.translate.instant('litemore.managers.educationSystems.pages.educationSystemsList.deleteSwal.no'),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false,
		});

		if (result.isConfirmed) {
			this.deleteEducationSystem(educationSystemItem, index);
		}
	}

	private deleteEducationSystem(educationSystemItem: CountryEducationSystemItem, index: number) {
		educationSystemItem["isDeleting"] = true;

		this.litemoreService.deleteEducationSystem(educationSystemItem.educationSystemId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.dataSource.filteredData.splice(index, 1);
				this.responseHandler.success(res, "deleteEducationSystem()");
				educationSystemItem["isDeleting"] = false;
			},
			error: (error: any) => {
				this.responseHandler.error(error, "deleteEducationSystem()");
				educationSystemItem["isDeleting"] = false;
			},
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
