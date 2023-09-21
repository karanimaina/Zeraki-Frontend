import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginGuard } from "./@core/shared/guards/login.guard";
import { JointAccountModule } from "./joint-account/joint-account.module";
import { AccountInvalidComponent } from "./lock/account-invalid/account-invalid.component";

const routes: Routes = [
	{
		path: "account",
		loadChildren: () => import("./lock/lock.module").then((m) => m.LockModule)
	},
	{ path: "invalid", component: AccountInvalidComponent },
	{
		path: "joint",
		loadChildren: () =>
			import("./joint-account/joint-account.module").then(
				(m) => JointAccountModule
			)
	},
	{
		path: "auth",
		canActivate: [LoginGuard],
		loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule)
	},
	{
		path: "school",
		loadChildren: () =>
			import("./main/school/school.module").then((m) => m.SchoolModule)
	},
	{
		path: "main",
		loadChildren: () => import("./main/main.module").then((m) => m.MainModule)
	},
	{
		path: "setup",
		loadChildren: () =>
			import("./school-setup/school-setup.module").then(
				(m) => m.SchoolSetupModule
			)
	},
	{
		path: "litemore",
		loadChildren: () =>
			import("./litemore/litemore.module").then((m) => m.LitemoreModule)
	},
	{
		path: "approval",
		loadChildren: () =>
			import("./awaiting-approval/awaiting-approval.module").then(
				(m) => m.AwaitingApprovalModule
			)
	},
	{ path: "", redirectTo: "auth", pathMatch: "full" },
	{ path: "**", redirectTo: "auth" }
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			useHash: true
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}
