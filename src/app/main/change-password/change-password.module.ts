import { NgModule } from "@angular/core";

import { ChangePasswordRoutingModule } from "./change-password-routing.module";
import { ChangePasswordTopNavComponent } from "./change-password-top-nav/change-password-top-nav.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		ChangePasswordTopNavComponent,
		ChangePasswordComponent
	],
	imports: [
		SharedModule,
		ChangePasswordRoutingModule,
		FormsModule
	],
	exports:[
		ChangePasswordComponent
	]
})
export class ChangePasswordModule { }
