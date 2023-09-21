import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateSchoolComponent } from "./create-school.component";

const routes: Routes = [
	{ path: "", component: CreateSchoolComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CreateSchoolRoutingModule { }
