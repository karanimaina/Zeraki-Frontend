import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as bdev from "./index";

const routes: Routes = [
	{
		path: "", component: bdev.BdevsComponent,
		children: [
			{ path: "invoices", loadChildren: () => import("./invoices/invoices.module").then(m => m.InvoicesModule) },
			{ path: "schools", loadChildren: () => import("../managers/schools/schools.module").then(m => m.SchoolsModule) },
			{ path: "bdev-targets", loadChildren: () => import("./bdev-targets/bdev-targets.module").then(m => m.BdevTargetsModule) },
			{ path: "self-signup", loadChildren: () => import("./signups/signups.module").then(m => m.SignUpsModule) },
			{ path: "create-school", loadChildren: () => import("./create-school/create-school.module").then(m => m.CreateSchoolModule) },
			{ path: "search-reset-code", loadChildren: () => import("./reset-code/reset-code.module").then(m => m.ResetCodeModule) },
			{ path: "sms", loadChildren: () => import("../managers/sms/sms.module").then(m => m.SmsModule) },
			{ path: "zl-credentials", loadChildren: () => import("../managers/zl-credentials/zl-credentials.module").then(m => m.ZlCredentialsModule) },
			{ path: "reports", loadChildren: () => import("../reports/reports.module").then(m => m.ReportsModule) },
			{ path: "users", loadChildren: () => import("./users/users.module").then(m => m.UsersModule) },
			{ path: "p", loadChildren: () => import("../managers/partners/partners.module").then(m => m.PartnersModule) },
			{
				path: "zeraki-products", loadChildren: () => import("../managers/zeraki-products/zeraki-products.module").then(m => m.ZerakiProductsModule),
			},
			{ path: "feedback", loadChildren: () => import("../managers/feedback/feedback.module").then(m => m.FeedbackModule), },
			{ path: "", redirectTo: "schools", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BdevsRoutingModule { }
