import { NgModule } from "@angular/core";

import { SmsRoutingModule } from "./sms-routing.module";
import { SmsComponent } from "./sms.component";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		SmsComponent
	],
	imports: [
		SharedModule,
		SmsRoutingModule
	]
})
export class SmsModule { }
