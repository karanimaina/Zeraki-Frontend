import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { CompanyInfo } from "src/app/@core/models/litemore/invoice/company/company-info";

@Component({
	selector: "app-invoice",
	templateUrl: "./invoice.component.html",
	styleUrls: ["./invoice.component.scss"]
})
export class InvoiceComponent implements OnInit {

	params: any;
	invoiceInfo: any;
	loadingInvoice = true;
	companyInfo?: CompanyInfo;
	schoolInfo: LitemoreSchoolProfile = <LitemoreSchoolProfile>{};

	constructor(
		private location: Location,
		private route: ActivatedRoute,
		private invoiceService: InvoiceService,
		private responseHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		this.route.params.subscribe(p => {
			this.params = p;
			this.getInvoice();
			// this.initDummyData()
		});
	}

	getInvoice() {
		this.invoiceService.getInvoiceById(this.params.invoiceid).subscribe({
			next: (res: any) => {
				this.schoolInfo["school"] = res?.school;
				this.companyInfo = res?.companyInfo;
				this.invoiceInfo = res;
			},
			error: err => this.responseHandler.error(err, "loadInvoice()"),
			complete: () => this.loadingInvoice = false,
		});
	}

	goBack() {
		this.location.back();
	}

	printPage(printSectionId) {

		const innerContents = document?.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open("", "_blank", "width=device-width");
		popupWinindow?.document.open();
		popupWinindow?.document.write("<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"assets_new/styles/vendor.cf60403d.css\"><link rel=\"stylesheet\" href=\"assets_new/styles/style.bb02c2e3.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" + innerContents + "</html>");
		popupWinindow?.document.close();
	}
}
