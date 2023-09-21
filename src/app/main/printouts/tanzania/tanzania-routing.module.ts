import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OnlyTeacherGuard } from "src/app/@core/shared/guards/only-teacher.guard";
import { TzReportFormsComponent } from "./tz-report-forms/tz-report-forms.component";

const routes: Routes = [
	{
		path: "",
		component: TzReportFormsComponent,
		canActivate: [OnlyTeacherGuard]
	},
	{
		path: ":userid/:streamid/:seriesid/:egroupid/:intakeid",
		component: TzReportFormsComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TanzaniaRoutingModule { }
