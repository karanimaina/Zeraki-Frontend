import { NgModule } from "@angular/core";

import { PartnersRoutingModule } from "./partners-routing.module";
import * as partners from "./index";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";


@NgModule({
	declarations: [
		partners.PartnersComponent,
		partners.PartnerRequestsComponent,
		partners.PartnerListComponent
	],
	imports: [
		FormsModule,
		PartnersRoutingModule,
		NgSelectModule,
		SharedModule,
		TranslateModule
	]
})
export class PartnersModule { }
