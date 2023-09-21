import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as teachers from "./index";

const routes: Routes = [
	{
		path: "", component: teachers.TeachersComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "manage", component: teachers.ManageTeachersComponent },
			{ path: "add", canActivate: [OnlyAdminGuard], component: teachers.AddTeacherComponent },
			{ path: "groups", canActivate: [OnlyAdminGuard], component: teachers.TeacherGroupsComponent },
			{ path: "teacher/:userid", component: teachers.TeacherClassesComponent },
			{ path: "", redirectTo: "manage", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TeachersRoutingModule { }
