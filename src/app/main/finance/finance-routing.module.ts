import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StudentFinanceGuard } from "src/app/@core/shared/guards/finance/student-finance.guard";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import * as finance from "./index";

const routes: Routes = [
	{
		path: "", component: finance.FinanceComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "sch-fin", component: finance.PDashboardComponent, canActivate: [StudentFinanceGuard] },
			{ path: "student", loadChildren: () => import("./student/student.module").then(m => m.StudentModule) },
			{ path: "fee-str", component: finance.FeeStructureComponent },
			{ path: "fee-str/:feeStructureId", component: finance.FeeStructureViewComponent },
			{ path: "", redirectTo: "sch-fin", pathMatch: "full" },
			{ path: "**", redirectTo: "sch-fin", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FinanceRoutingModule { }
