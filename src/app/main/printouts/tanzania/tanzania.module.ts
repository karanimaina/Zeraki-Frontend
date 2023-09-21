import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../../../@core/shared/shared.module";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "@danielmoncada/angular-datetime-picker";
import { NgxPrintModule } from "ngx-print";
import { TanzaniaRoutingModule } from "./tanzania-routing.module";
import * as components from "./index";

@NgModule({
	declarations: [
		components.TzReportFormsComponent,
		components.TzSecPerfComponent,
		components.TzSecGradesComponent,
		components.TzSecBehaviourComponent,
		components.TzSecCommentsComponent,
		components.EventsComponent,
		components.OpenDateComponent
	],
	imports: [
		TanzaniaRoutingModule,
		TranslateModule,
		SharedModule,
		OwlDateTimeModule,
		OwlNativeDateTimeModule,
		NgxPrintModule
	]
})
export class TanzaniaModule { }
