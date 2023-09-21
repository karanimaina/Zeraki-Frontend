import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { FirstSetupComponent } from "./first-setup/first-setup.component";
import * as dashboard from "./index";

const routes: Routes = [
	{
		path: "", component: dashboard.DashboardComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "welcome", component: dashboard.WelcomeComponent },
			{ path: "setup", component: FirstSetupComponent },
			{ path: "welcome/attendance-report/:id", component: dashboard.IntakeAttendanceReportComponent },
			{ path: "global", component: dashboard.GlobalComponent },
			{ path: "myclasses", component: dashboard.MyClassesComponent },
			{ path: "attendance-report", component: dashboard.AttendanceReportComponent },
			{ path: "gradclasses", component: dashboard.GradClassesComponent },
			{ path: "", redirectTo: "welcome", pathMatch: "full" },
		]
	}
];

export const components = [
	dashboard.DashboardComponent,
	dashboard.GlobalComponent,
	dashboard.MyClassesComponent,
	dashboard.GradClassesComponent,
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DashboardRoutingModule { }
