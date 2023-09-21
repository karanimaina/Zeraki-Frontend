import { NgModule } from "@angular/core";
import { DatePipe } from "@angular/common";

import { LeavingCertsRoutingModule } from "./leaving-certs-routing.module";
import { LeavingCertsComponent } from "./leaving-certs.component";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FormOrYearPipe, SchoolTitlePipe } from "src/app/@core/shared";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { LeavingCertDocComponent } from "./leaving-cert-doc/leaving-cert-doc.component";


@NgModule({
	declarations: [LeavingCertsComponent, LeavingCertDocComponent],
	imports: [
		LeavingCertsRoutingModule,
		FormsModule,
		NgSelectModule,
		SharedModule,
		PdfViewerModule
	],
	providers: [
		FormOrYearPipe,
		SchoolTitlePipe,
		DatePipe
	],
})
export class LeavingCertsModule { }
