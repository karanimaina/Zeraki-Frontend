import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SettingsRoutingModule } from "./settings-routing.module";
import * as settings from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { SettingsTopNavComponent } from "./index";


@NgModule({
	declarations: [
		settings.SettingsComponent,
		settings.MyProfileComponent,
		settings.SchoolProfileComponent,
		settings.SettingsTopNavComponent,
		settings.SchoolOptionsComponent,
		settings.UserRolesComponent
	],
	exports: [
		SettingsTopNavComponent
	],
	imports: [
		FormsModule,
		SharedModule,
		SettingsRoutingModule,
		NgSelectModule,
		MatSlideToggleModule,
	]
})
export class SettingsModule { }
