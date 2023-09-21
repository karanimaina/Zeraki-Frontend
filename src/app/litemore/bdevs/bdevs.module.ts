import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BdevsRoutingModule } from "./bdevs-routing.module";
import { FormsModule } from "@angular/forms";
import { ChangePasswordModule } from "src/app/main/change-password/change-password.module";
import * as bdev from "./index";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
	declarations: [
		bdev.BdevsComponent,
		bdev.ResetPasswordComponent,
	],
	imports: [
		CommonModule,
		BdevsRoutingModule,
		FormsModule,
		ChangePasswordModule,
		TranslateModule
	]
})
export class BdevsModule { }
