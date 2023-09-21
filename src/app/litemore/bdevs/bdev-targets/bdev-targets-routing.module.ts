import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BdevTargetsComponent } from "./bdev-targets.component";

const routes: Routes = [
	{ path: "", component: BdevTargetsComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BdevTargetsRoutingModule { }
