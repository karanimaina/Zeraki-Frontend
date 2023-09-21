import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as components from "./index";
import { OnlyTeacherGuard } from "../../../@core/shared/guards/only-teacher.guard";

const routes: Routes = [
	{
		path: "",
		component: components.ReportFormsComponent,
		canActivate: [OnlyTeacherGuard]
	},
	{
		path: ":userid/:streamid/:seriesid/:egroupid/:intakeid",
		component: components.ReportFormsComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportFormsRoutingModule { }
