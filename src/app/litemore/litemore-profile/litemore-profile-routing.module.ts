import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LitemoreProfileComponent } from "./litemore-profile.component";

const routes: Routes = [
	{ path: "", component: LitemoreProfileComponent}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LitemoreProfileRoutingModule { }
