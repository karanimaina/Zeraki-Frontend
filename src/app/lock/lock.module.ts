import { NgModule } from "@angular/core";

import { InvoiceRoutingModule } from "./lock-routing.module";
import { ProformaInvoiceComponent } from "./proforma-invoice/proforma-invoice.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { InvoiceTopNavComponent } from "./invoice-top-nav/invoice-top-nav.component";
import { LayoutModule } from "../layout/layout.module";
import { AccountLockComponent } from "./account-lock/account-lock.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { AccountInvalidComponent } from "./account-invalid/account-invalid.component";
import { TranslateModule } from "@ngx-translate/core";
import { LockComponent } from "./lock.component";
import { InvoiceModule } from "../litemore/bdevs/invoices/invoice/invoice.module";
import { InvoicesPrintModule } from "../@core/shared/modules/invoices-print/invoices-print.module";

@NgModule({
	declarations: [
		LockComponent,
		ProformaInvoiceComponent,
		InvoiceComponent,
		InvoiceTopNavComponent,
		AccountLockComponent,
		AccountInvalidComponent
	],
	imports: [
		InvoiceRoutingModule,
		LayoutModule,
		SharedModule,
		TranslateModule,
		InvoiceModule,
		InvoicesPrintModule,
	]
})
export class LockModule { }
