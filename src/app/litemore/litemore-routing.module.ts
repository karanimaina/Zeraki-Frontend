import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as litemore from "./index";
import { BdevGuard } from "../@core/shared/guards/bdev.guard";
import { AccountManagerGuard } from "../@core/shared/guards/account-manager.guard";
import { ResetPasswordComponent } from "./bdevs/reset-password/reset-password.component";
import { LitemoreAuthGuard } from "../@core/shared/guards/auth/litemore-auth.guard";
// import { SchoolsComponent } from "./schools";

const routes: Routes = [
	{
		path: "", canActivate: [LitemoreAuthGuard], component: litemore.LitemoreComponent,
		children: [
			{ path: "reset-password", component: ResetPasswordComponent },
			{
				path: "mg", canActivate: [AccountManagerGuard], loadChildren: () => import("./managers/managers.module").then(m => m.ManagersModule),
			},
			{
				path: "am", canActivate: [BdevGuard], loadChildren: () => import("./bdevs/bdevs.module").then(m => m.BdevsModule)
			},
			{
				path: "profile", loadChildren: () => import("./litemore-profile/litemore-profile.module").then(m => m.LitemoreProfileModule)
			},
			{
				path: "banners", loadChildren: () => import("./banners/banners.module").then(m => m.BannersModule)
			},
			{
				path: "", redirectTo: "mg", pathMatch: "full"
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LitemoreRoutingModule { }
