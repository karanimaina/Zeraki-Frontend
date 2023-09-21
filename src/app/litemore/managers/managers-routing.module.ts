import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ManagersComponent } from "./managers.component";

const routes: Routes = [
	{
		path: "", component: ManagersComponent,
		children: [
			{
				path: "schools", loadChildren: () => import("./schools/schools.module").then(m => m.SchoolsModule),
			},
			{
				path: "users", loadChildren: () => import("./users/users.module").then(m => m.UsersModule),
			},
			{
				path: "p", loadChildren: () => import("./partners/partners.module").then(m => m.PartnersModule),
			},
			{
				path: "feedback", loadChildren: () => import("./feedback/feedback.module").then(m => m.FeedbackModule),
			},
			{
				path: "shop-payments", loadChildren: () => import("./shop-payments/shop-payments.module").then(m => m.ShopPaymentsModule),
			},
			{
				path: "zl-credentials", loadChildren: () => import("./zl-credentials/zl-credentials.module").then(m => m.ZlCredentialsModule),
			},
			{
				path: "zeraki-products", loadChildren: () => import("./zeraki-products/zeraki-products.module").then(m => m.ZerakiProductsModule),
			},
			{
				path: "faqs", loadChildren: () => import("./faqs/faqs.module").then(m => m.FaqsModule),
			},
			{
				path: "self-signup", loadChildren: () => import("../bdevs/signups/signups.module").then(m => m.SignUpsModule),
			},
			{
				path: "sms", loadChildren: () => import("./sms/sms.module").then(m => m.SmsModule),
			},
			{
				path: "countries", loadChildren: () => import("./countries/countries.module").then(m => m.CountriesModule),
			},
			{
				path: "regions", loadChildren: () => import("./regions/regions.module").then(m => m.RegionsModule),
			},
			{
				path: "counties", loadChildren: () => import("./counties/counties.module").then(m => m.CountiesModule),
			},
			{ path: "reports", loadChildren: () => import("../reports/reports.module").then(m => m.ReportsModule) },
			{
				path: "education-systems", loadChildren: () => import("./education-systems/education-systems.module").then(m => m.EducationSystemsModule),
			},
			{ path: "", redirectTo: "schools", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ManagersRoutingModule { }
