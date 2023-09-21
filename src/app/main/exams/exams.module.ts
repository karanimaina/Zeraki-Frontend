import { NgModule } from "@angular/core";

import { ExamsRoutingModule } from "./exams-routing.module";

import { SharedModule } from "src/app/@core/shared/shared.module";
import {ExamsTopNavComponent} from "./components/exams-top-nav/exams-top-nav.component";
import {ExamsComponent} from "./exams.component";
import {TranslateModule} from "@ngx-translate/core";
import {CoefficientViewComponent} from "./components/coefficient-view/coefficient-view.component";

@NgModule({
	declarations: [
		ExamsComponent,
		ExamsTopNavComponent,
		CoefficientViewComponent,
	],
	exports: [
		ExamsTopNavComponent,
		CoefficientViewComponent,

	],
	imports: [
		SharedModule,
		ExamsRoutingModule,
		TranslateModule
	]
})
export class ExamsModule { }
