import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MeritListComponent } from "./merit-list.component";

const routes: Routes = [
	{path: "", component: MeritListComponent}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MeritListRoutingModule { }
