import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-proforma-invoice",
	templateUrl: "./proforma-invoice.component.html",
	styleUrls: ["./proforma-invoice.component.scss"]
})
export class ProformaInvoiceComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();

	schoolInfo: LitemoreSchoolProfile = <LitemoreSchoolProfile>{};
	params: any;
	isLoadingProformaInvoice = false;
	proforma: any;

	constructor(
		private location: Location,
		private route: ActivatedRoute,
		private invoiceService: InvoiceService,
		private responseHandlerService: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.route.params.subscribe(p => {
			this.params = p;
			this.loadProformaInvoice();
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	loadProformaInvoice() {
		this.isLoadingProformaInvoice = true;

		this.invoiceService.getProformaInvoiceById(this.params.proformaid).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res) => {
				this.schoolInfo["school"] = res?.school;
				this.schoolInfo["balance"] = res?.school?.balance;

				this.proforma = res;
			},
			error: (err) =>	this.responseHandlerService.error(err, "loadProformaInvoice()"),
			complete: () => this.isLoadingProformaInvoice = false,
		}, );
	}

	goBack() {
		this.location.back();
	}

}
