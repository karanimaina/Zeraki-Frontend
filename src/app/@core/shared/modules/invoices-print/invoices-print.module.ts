import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProformaPrintPreviewComponent } from "./proforma-print-preview/proforma-print-preview.component";
import { PdfViewerModule } from "ng2-pdf-viewer";



@NgModule({
	declarations: [
		ProformaPrintPreviewComponent
	],
	imports: [
		CommonModule,
		PdfViewerModule
	],
	exports: [
		ProformaPrintPreviewComponent
	]
})
export class InvoicesPrintModule { }
