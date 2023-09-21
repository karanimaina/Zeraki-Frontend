import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";

@Component({
	selector: "app-shop-payments",
	templateUrl: "./shop-payments.component.html",
	styleUrls: ["./shop-payments.component.scss"]
})
export class ShopPaymentsComponent implements OnInit, OnDestroy {
	shopPaymentListSub!: Subscription;
	shopPaymentListLoading = false;
	shopPaymentList: any;
	dataSource: MatTableDataSource<any> = new MatTableDataSource();

	currentPage = 1;
	totalPages!: number;

	searchForm = this.fb.group({
		phoneNumber: [""],
		transCode: [""],
		orderID: [""],
	});

	get phoneNumber(): AbstractControl | null {
		return this.searchForm.get("phoneNumber");
	}
	get transCode(): AbstractControl | null {
		return this.searchForm.get("transCode");
	}
	get orderID(): AbstractControl | null {
		return this.searchForm.get("orderID");
	}

	constructor(
    private fb: FormBuilder,
    private litemoreService: LitemoreService,
    private toast: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.retrieveShopPaymentList();
	}

	ngOnDestroy(): void {
		this.shopPaymentListSub?.unsubscribe();
	}

	retrievePageResults(page: number) {
		this.currentPage = page;
		this.submitSearchForm();
	}

	resetSearchForm() {
		this.searchForm.reset();
		this.submitSearchForm();
	}

	submitSearchForm() {
		const form = this.searchForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const phoneNumber = form.value["phoneNumber"];
		const transCode = form.value["transCode"];
		const orderID = form.value["orderID"];

		this.retrieveShopPaymentList(phoneNumber, transCode, orderID);
	}

	retrieveShopPaymentList(phoneNumber?: string, transCode?: string, orderID?: string) {
		this.shopPaymentListLoading = true;

		const params = `?currentPage=${this.currentPage}&phoneNumber=${phoneNumber ?? ""}&transCode=${transCode ?? ""}&orderId=${orderID ?? ""}`;

		this.shopPaymentListSub = this.litemoreService.getZerakiShopPayments(params).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.currentPage = resp.currentPage;
				this.totalPages = resp.totalPages;
				this.shopPaymentList = resp.payments || [];
				this.dataSource = new MatTableDataSource(this.shopPaymentList);
				this.shopPaymentListLoading = false;
			},
			error: err => {
				console.error(err);

				this.shopPaymentListLoading = false;
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});
	}

}
