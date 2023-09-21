import { NgModule } from "@angular/core";

import { ClassListsRoutingModule } from "./class-lists-routing.module";
import { ClassListsComponent } from "./class-lists.component";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatSortModule } from "@angular/material/sort";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { FormOrYearPipe } from "src/app/@core/shared";


@NgModule({
	declarations: [ClassListsComponent],
	imports: [
		ClassListsRoutingModule,
		FormsModule,
		NgSelectModule,
		TranslateModule,
		SharedModule,
		MatSortModule,
		PdfViewerModule
	],
	providers: [
		FormOrYearPipe
	]
})
export class ClassListsModule { }
