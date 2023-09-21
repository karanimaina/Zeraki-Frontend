import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AwaitingApprovalComponent } from "./awaiting-approval.component";

const routes: Routes = [
	{path: "", component: AwaitingApprovalComponent}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AwaitingApprovalRoutingModule { }
