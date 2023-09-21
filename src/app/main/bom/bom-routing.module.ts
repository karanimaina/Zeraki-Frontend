import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as bom from "./index";

const routes: Routes = [
	{
		path: "", component: bom.BomComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "manage", component: bom.ManageBomComponent },
			{ path: "add", canActivate: [OnlyAdminGuard], component: bom.BomAddComponent },
			{ path: "groups", canActivate: [OnlyAdminGuard], component: bom.BomGroupsComponent },
			{ path: "", redirectTo: "manage", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BomRoutingModule { }
