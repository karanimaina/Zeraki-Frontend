import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CoefficientSystemComponent } from "./coefficient-system.component";

const routes: Routes = [
	{ path: "", component: CoefficientSystemComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CoefficientSystemRoutingModule { }
