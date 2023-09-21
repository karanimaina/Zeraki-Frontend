import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as components from "../index";

const routes: Routes = [
	{ path: "", component: components.StudentDashboardComponent },
	// { path: "create-plan", component: components.CreateMicroPaymentComponent },
	// { path: "make-payment", component: components.MakePaymentComponent },
	{ path: "**", component: components.StudentDashboardComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StudentRoutingModule { }
