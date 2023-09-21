import {NgModule} from "@angular/core";
import {
	ActivitiesComponent,
	FeeBalanceComponent,
	KeyWordsComponent,
	ProjectsComponent,
	SchoolDatesComponent,
	ScoreRangeIdentifiersComponent,
	StudentReportComponent,
	SubjectResultsComponent
} from "./components";
import {SharedModule} from "../../../../@core/shared/shared.module";
import {RouterModule, Routes} from "@angular/router";
import {OLevelReportFormsComponent} from "./olevel-report-forms.component";
import {OlevelReportsModule} from "../olevel-reports.module";
import {NgxPrintModule} from "ngx-print";
import { ExtractImagesFromDomComponent } from "./components/extract-images-from-dom/extract-images-from-dom.component";

const routes: Routes = [
	{
		path: "",
		component: OLevelReportFormsComponent
	}
];

@NgModule({
	declarations: [
		OLevelReportFormsComponent,
		StudentReportComponent,
		ActivitiesComponent,
		FeeBalanceComponent,
		KeyWordsComponent,
		ProjectsComponent,
		SchoolDatesComponent,
		ScoreRangeIdentifiersComponent,
		SubjectResultsComponent,
		ExtractImagesFromDomComponent
	],
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
		OlevelReportsModule,
		NgxPrintModule
	],
	exports: [
		StudentReportComponent
	]
})
export class OlevelReportFormsModule {}
