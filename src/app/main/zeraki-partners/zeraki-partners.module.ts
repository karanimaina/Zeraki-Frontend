import { NgModule } from "@angular/core";

import { ZerakiPartnersRoutingModule } from "./zeraki-partners-routing.module";
import { ZerakiPartnersComponent } from "./zeraki-partners.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { AccountDetailsComponent } from "./components/account-details/account-details.component";
import { MySchoolsComponent } from "./components/my-schools/my-schools.component";
import { ZerakiPatnersTopNavComponent } from "./components/zeraki-patners-top-nav/zeraki-patners-top-nav.component";


@NgModule({
	declarations: [
		ZerakiPartnersComponent,
		ZerakiPatnersTopNavComponent,
		MySchoolsComponent,
		AccountDetailsComponent
	],
	imports: [
		ZerakiPartnersRoutingModule,
		SharedModule,
		ReactiveFormsModule,
		FormsModule,
		TranslateModule
	]
})
export class ZerakiPartnersModule { }
