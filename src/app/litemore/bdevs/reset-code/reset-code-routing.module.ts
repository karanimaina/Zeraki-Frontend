import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ResetCodeComponent } from "./reset-code.component";

const routes: Routes = [
	{ path: "", component: ResetCodeComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ResetCodeRoutingModule { }
