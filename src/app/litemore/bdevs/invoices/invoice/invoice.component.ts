import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";

@Component({
	selector: "app-invoice",
	templateUrl: "./invoice.component.html",
	styleUrls: ["./invoice.component.scss"]
})
export class InvoiceComponent implements OnInit {

	routeParams: any;
	schoolInfo!: LitemoreSchoolProfile;

	constructor(
    private route: ActivatedRoute,
    private bdevService: BdevService,
    private invoiceService: InvoiceService
	) { }

	ngOnInit(): void {
		this.getSchoolInfo();
		this.route.params.subscribe(p => {
			this.routeParams = p;
			this.loadProformaInvoice();
			this.loadSpecificSchoolDetails();
		});
	}


	loadProformaInvoice() {
		this.invoiceService.setInvoicesFromProforma(this.routeParams.school_id, this.routeParams.proforma_id, this.routeParams.is_proforma_invoice, "?currentPage=1");
	}

	private getSchoolInfo() {
		this.bdevService.getSchoolInfo().subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	loadSpecificSchoolDetails() {
		this.bdevService.setSchoolInfo(this.routeParams.school_id);
	}
}
