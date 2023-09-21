import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LeavingCertsComponent } from "./leaving-certs.component";

const routes: Routes = [
	{ path: "", component: LeavingCertsComponent}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LeavingCertsRoutingModule { }
