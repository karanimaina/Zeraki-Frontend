import { NgModule } from "@angular/core";

import { FaqsRoutingModule } from "./faqs-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FaqsComponent } from "./faqs.component";
import { CKEditorModule } from "ckeditor4-angular";
import { LightboxModule } from "ngx-lightbox";
import {
	FaqCategoriesComponent,
	FaqCategoriesListComponent,
	FaqCategoryDetailsComponent,
	FaqListComponent
} from "./pages";


@NgModule({
	declarations: [
		FaqsComponent,
		FaqListComponent,
		FaqCategoriesComponent,
		FaqCategoriesListComponent,
		FaqCategoryDetailsComponent
	],
	imports: [
		SharedModule,
		CKEditorModule,
		LightboxModule,
		FaqsRoutingModule
	]
})
export class FaqsModule { }
