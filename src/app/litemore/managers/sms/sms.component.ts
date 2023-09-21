import { Component, OnDestroy, OnInit } from "@angular/core";
import { Validators, AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-sms",
	templateUrl: "./sms.component.html",
	styleUrls: ["./sms.component.scss"]
})
export class SmsComponent implements OnInit, OnDestroy {
	zerakiSMSListSub!: Subscription;
	zerakiSMSListLoading = false;
	zerakiSMSList: any[] = [];
	dataSource: MatTableDataSource<any> = new MatTableDataSource();

	currentPage = 1;
	itemsPerPage = 10;
	totalPages!: number;

	searchForm = this.fb.group({
		schoolName: ["", Validators.required],
	});

	searchTermChanged = false;
	searchTermChangedSub?: Subscription;

	get schoolName(): AbstractControl | null {
		return this.searchForm.get("schoolName");
	}

	get schoolNameValue(): string {
		return this.searchForm.value["schoolName"];
	}

	searchZerakiSMSList = false;

	requiredValidator = Validators.required;

	constructor(
		private fb: FormBuilder,
		private litemoreService: LitemoreService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.searchTermChangedSub = this.searchForm.get("schoolName")?.valueChanges.subscribe(() => {
			this.searchTermChanged = true;
		});
	}

	ngOnDestroy(): void {
		this.zerakiSMSListSub?.unsubscribe();
		this.searchTermChangedSub?.unsubscribe();
	}

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	retrievePageResults(page: number) {
		this.currentPage = page;
		this.submitSearchForm();
	}

	resetSearchForm() {
		this.searchForm.reset({ schoolName: "" });
		this.resetPagination();
		this.submitSearchForm();
	}

	resetPagination() {
		this.currentPage = 1;
	}

	submitSearchForm() {
		const form = this.searchForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const schoolName = form.value["schoolName"];

		this.cancelAddSms();
		this.retrieveZerakiSMSList(schoolName);
	}

	allItems: any[] = [];

	retrieveZerakiSMSList(schoolName = "") {
		if ((this.allItems.length > 0) && (!this.searchTermChanged)) {
			return this.paginateLocally();
		}

		this.zerakiSMSListLoading = true;

		this.zerakiSMSListSub = this.litemoreService.getSMSSchools(schoolName).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.allItems = resp;

				this.resetPagination();

				const paginatedResponse = this.paginateList(resp, this.currentPage, this.itemsPerPage);
				// console.log(paginatedResponse);

				this.currentPage = paginatedResponse.currentPage;
				this.totalPages = paginatedResponse.totalPages;
				this.zerakiSMSList = paginatedResponse.list || [];
				this.dataSource = new MatTableDataSource(this.zerakiSMSList);
				this.zerakiSMSListLoading = false;
				this.searchZerakiSMSList = true;
				this.searchTermChanged = false;
			},
			error: err => {
				this.zerakiSMSListLoading = false;
				this.searchTermChanged = false;
				this.responseHandler.error(err, "retrieveZerakiSMSList()");
			}
		});
	}

	paginateLocally() {
		const paginatedResponse = this.paginateList(this.allItems, this.currentPage, this.itemsPerPage);
		// console.log(paginatedResponse);

		this.currentPage = paginatedResponse.currentPage;
		this.totalPages = paginatedResponse.totalPages;
		this.zerakiSMSList = paginatedResponse.list || [];
		this.dataSource = new MatTableDataSource(this.zerakiSMSList);

		this.searchTermChanged = false;

		return;
	}

	// TODO: move to util service and reuse
	paginateList(list: any[], pageNumber: number, recordsPerPage: number) {
		interface PaginatedResponse {
			currentPage: number;
			list: any[];
			totalPages: number;
		}

		const paginatedResponse: PaginatedResponse = {
			currentPage: 1,
			list: [],
			totalPages: 1
		};

		// calculate number of pages
		let pages = Math.floor(list.length / recordsPerPage);
		if ((list.length % recordsPerPage) > 0) {
			pages = pages + 1;
		}
		//set total number of pages
		paginatedResponse.totalPages = pages;

		//set current page number
		paginatedResponse.currentPage = pageNumber;

		const dataList: any[] = [];
		const beginIndex = recordsPerPage * (pageNumber - 1);
		const limitIndex = beginIndex + recordsPerPage;

		for (let a = beginIndex; a < limitIndex; a++) {
			if (list[a] === undefined) {
				break;
			} else {
				dataList.push(list[a]);
			}
		}

		//set current data table
		paginatedResponse.list = dataList;

		return paginatedResponse;
	}

	addSMSForm = this.fb.group({
		smsAmount: [null, Validators.required],
	});

	get smsAmount(): AbstractControl | null {
		return this.addSMSForm.get("smsAmount");
	}

	submitAddSMSForm() {
		const form = this.addSMSForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const smsSizeToAdd = form.value["smsAmount"];

		// console.log(smsSizeToAdd, this.search.sms_school.name, this.search.sms_school.schoolid);

		this.addSms(smsSizeToAdd);
	}

	search: any = {
		sms_school: null,
	};

	addSmsInit(school: any) {
		this.search.sms_school = school;
	}

	cancelAddSms() {
		this.search = {};
		this.search.name = null;
		this.search.schools = [];
		this.search.sms_school = null;
		this.search.sms_size_to_add = null;
		this.search.sms_add_successful = false;
		this.search.sms_add_successful_msg = "";

		this.addSMSForm.reset();
	}

	addSms(smsSizeToAdd: number) {
		const title = this.translate.instant("litemore.managers.sms.addSms.title")
		const text = "Are you sure you'd like to add " + smsSizeToAdd + " SMSs to " + this.search.sms_school.name + "?";
		this.translate.instant('litemore.managers.sms.addSms.text',{
			sms:smsSizeToAdd,
			school:this.search.sms_school.name
		})
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.litemoreService.updateSchoolSMS(this.search.sms_school.schoolid, smsSizeToAdd).subscribe({
					next: (resp: any) => {
						// console.log(resp);

						if (resp.responseCode === 200) {
							// this.search.sms_add_successful = true;
							this.responseHandler.success(resp);
						} else {
							this.responseHandler.warn(resp);
						}

						this.search.sms_add_successful = true;
						this.search.sms_add_successful_msg = resp.message;

						this.addSMSForm.reset();
					},
					error: (err: any) => {
						this.responseHandler.error(err, "addSms()");
					},
				});
			}
		});
	}
}
