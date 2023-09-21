import { NgModule } from "@angular/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import * as layout from "./index";
import { NgScrollbarModule } from "ngx-scrollbar";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MainRoutingModule } from "../main/main-routing.module";
import { SharedModule } from "../@core/shared/shared.module";


@NgModule({
	declarations: [
		layout.SideNavComponent,
		layout.TopNavComponent,
		layout.MobileNavComponent,
		layout.SchoolTopNavComponent,
		layout.LitTopNavComponent,
		layout.LitSideNavComponent,
		layout.BasicTopNavComponent,
		layout.LitMobileNavComponent,
		layout.SchoolsTypeNavListComponent,
	],
	imports: [
		SharedModule,
		MatMenuModule,
		MatIconModule,
		NgScrollbarModule,
		ScrollingModule,
		MainRoutingModule,
	],
	exports: [
		layout.SideNavComponent,
		layout.TopNavComponent,
		layout.MobileNavComponent,
		layout.SchoolTopNavComponent,
		layout.LitTopNavComponent,
		layout.LitSideNavComponent,
		layout.BasicTopNavComponent,
		layout.LitMobileNavComponent
	]
})
export class LayoutModule { }
