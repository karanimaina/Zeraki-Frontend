import { NgModule } from "@angular/core";
import {OlevelMeritListComponent} from "./olevel-merit-list.component";
import {SharedModule} from "../../../../@core/shared/shared.module";
import {RouterModule, Routes} from "@angular/router";
import { OlevelMeritListFormComponent } from "./components/olevel-merit-list-form/olevel-merit-list-form.component";
import {OlevelReportsModule} from "../olevel-reports.module";
import {NgxPrintModule} from "ngx-print";
import { OlevelMeritListOptionsComponent } from "./components/olevel-merit-list-options/olevel-merit-list-options.component";
import {OlevelMeritListPdf} from "./services/olevel-merit-list-pdf";

const routes: Routes = [
	{path: "", component: OlevelMeritListComponent}
];

@NgModule({
	declarations: [
		OlevelMeritListComponent,
		OlevelMeritListFormComponent,
		OlevelMeritListOptionsComponent
	],
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
		OlevelReportsModule,
		NgxPrintModule
	],
	providers: [
		OlevelMeritListPdf
	]
})
export class OlevelMeritListModule { }
