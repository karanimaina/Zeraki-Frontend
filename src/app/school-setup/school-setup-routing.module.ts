import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService } from "../@core/shared/guards/auth/auth-guard.service";
import { NetworkGuard } from "../@core/shared/guards/network/network.guard";
import { SetupIncompleteGuard } from "../@core/shared/guards/setup-incomplete/setup-incomplete.guard";
import * as setup from "./index";

const routes: Routes = [
	{
		path: "",
		component: setup.SchoolSetupComponent,
		canActivate: [AuthGuardService, SetupIncompleteGuard],
		canActivateChild: [NetworkGuard],
		children: [
			{ path: "welcome", component: setup.SetupWelcomeComponent },
			{ path: "add", component: setup.SetupWizardComponent },
			{ path: "", redirectTo: "welcome", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SchoolSetupRoutingModule { }
