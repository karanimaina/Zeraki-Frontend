import { NgModule } from "@angular/core";

import * as components from "./index";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { InvoiceModule } from "../invoice/invoice.module";
import { ProformaRoutingModule } from "./proforma-routing.module";
import { InvoicesPrintModule } from "src/app/@core/shared/modules/invoices-print/invoices-print.module";


@NgModule({
	declarations: [
		components.ProformaComponent,
		components.SectionOldInvoicesComponent,
		components.SectionProformaInvoicesComponent,
		components.CreateProformaComponent,
	],
	imports: [
		ProformaRoutingModule,
		FormsModule,
		NgSelectModule,
		SharedModule,
		PdfViewerModule,
		InvoiceModule,
		InvoicesPrintModule
	]
})
export class ProformaModule { }
