import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as staff from "./index";


const routes: Routes = [
	{
		path: "", component: staff.StaffComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "manage", component: staff.ManageStaffComponent },
			{ path: "add", canActivate: [OnlyAdminGuard], component: staff.AddStaffComponent },
			{ path: "groups", canActivate: [OnlyAdminGuard], component: staff.GroupsStaffComponent },
			{ path: "", redirectTo: "manage", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StaffRoutingModule { }
