import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import * as opps from "./index";

const routes: Routes = [
	{
		path : "", component: opps.OpportunitiesComponent, canActivateChild: [NetworkGuard],
		children : [
			{ path: "vac", component: opps.VacanciesComponent },
			{ path: "swap", component: opps.SwapComponent },
			{ path: "match", component: opps.MatchComponent },
			{ path: "", redirectTo: "vac", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OpportunitiesRoutingModule { }
