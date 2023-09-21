import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as reports from "./index";

const routes: Routes = [
	{
		path: "", component: reports.ReportsComponent,
		children: [
			{ path: "", component: reports.ReportComponent}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportsRoutingModule { }
