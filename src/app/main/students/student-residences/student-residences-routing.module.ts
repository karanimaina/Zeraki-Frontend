import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as residences from "./index";

const routes: Routes = [
	{
		path: "",
		canActivate: [OnlyAdminGuard],
		component: residences.StudentResidencesComponent
	},
	{
		path: ":id",
		canActivate: [OnlyAdminGuard],
		component: residences.StudentHouseListComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StudentResidencesRoutingModule {}
