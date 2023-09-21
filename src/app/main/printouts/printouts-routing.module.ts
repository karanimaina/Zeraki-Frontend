import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as printout from "./index";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";

const routes: Routes = [
	{
		path: "",
		component: printout.PrintoutsComponent,
		canActivateChild: [NetworkGuard],
		children: [
			{
				path: "analysis",
				loadChildren: () =>
					import("./analysis-report/analysis-report.module").then(
						(m) => m.AnalysisReportModule
					)
			},
			{
				path: "clists",
				loadChildren: () =>
					import("./class-lists/class-lists.module").then(
						(m) => m.ClassListsModule
					)
			},
			{
				path: "house-lists",
				loadChildren: () =>
					import("./house-lists/house-lists.module").then(
						(m) => m.HouseListsModule
					)
			},
			{
				path: "lcerts",
				loadChildren: () =>
					import("./leaving-certs/leaving-certs.module").then(
						(m) => m.LeavingCertsModule
					)
			},
			{
				path: "mlist",
				loadChildren: () =>
					import("./merit-list/merit-list.module").then(
						(m) => m.MeritListModule
					)
			},
			{
				path: "rform",
				loadChildren: () =>
					import("./report-forms/report-forms.module").then(
						(m) => m.ReportFormsModule
					)
			},
			{
				path: "transcripts",
				loadChildren: () =>
					import("./transcripts/transcripts.module").then(
						(m) => m.TranscriptsModule
					)
			},
			{
				path: "olevels",
				loadChildren: () =>
					import("./olevels/olevel-reports.module").then(
						(m) => m.OlevelReportsModule
					)
			},
			{
				path: "tz-rform",
				loadChildren: () =>
					import("./tanzania/tanzania.module").then((m) => m.TanzaniaModule)
			},
			{ path: "", redirectTo: "clists", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PrintoutsRoutingModule {}
