import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyTeacherGuard } from "src/app/@core/shared/guards/only-teacher.guard";
import * as settings from "./index";
import {OnlyAdminGuard} from "../../@core/shared/guards/only-admin.guard";

const routes: Routes = [
	{
		path : "", component: settings.SettingsComponent, canActivateChild: [NetworkGuard],
		children : [
			{ path: "school-prof", canActivate:[OnlyTeacherGuard], component: settings.SchoolProfileComponent },
			{ path: "school-opt",  canActivate:[OnlyTeacherGuard], component: settings.SchoolOptionsComponent },
			{
				path: "compulsory-subjects",
				canActivate: [OnlyAdminGuard],
				loadChildren: () => import("./compulsory-subjects/compulsory-subjects.module").then(m => m.CompulsorySubjectsModule)
			},
			{ path: "usr-roles",   canActivate:[OnlyTeacherGuard], component: settings.UserRolesComponent },
			{ path: "", redirectTo: "school-prof", pathMatch: "full" },
		]
	},
	{ path: "my-prof", component: settings.MyProfileComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SettingsRoutingModule { }
