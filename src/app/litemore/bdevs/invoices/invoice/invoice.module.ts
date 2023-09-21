import { NgModule } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { InvoiceRoutingModule } from "./invoice-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import * as components from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { PdfViewerModule } from "ng2-pdf-viewer";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
	declarations: [
		components.InvoiceComponent,
		components.CreditNotesComponent,
		components.InvoiceListComponent,
		components.CreateCreditNoteComponent,
		components.CreditNotesListComponent,
		components.CreditNotePrintPreviewComponent,
		components.InvoicePrintPreviewComponent,
		components.InvoiceCollectionsComponent,
		components.ManageInvoiceCollectionsComponent,
		components.AddCollectionComponent,
		components.CreateInvoiceComponent
	],
	imports: [
		FormsModule,
		InvoiceRoutingModule,
		ReactiveFormsModule,
		SharedModule,
		PdfViewerModule,
		TranslateModule
	],
	exports: [
		components.InvoiceCollectionsComponent,
		components.InvoicePrintPreviewComponent,
		components.ManageInvoiceCollectionsComponent
	],
	providers: [CurrencyPipe]
})
export class InvoiceModule {}
