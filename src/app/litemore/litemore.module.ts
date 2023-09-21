import { NgModule } from "@angular/core";

import { LitemoreRoutingModule } from "./litemore-routing.module";
import { LitemoreComponent } from "./litemore.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgScrollbarModule } from "ngx-scrollbar";
import { LayoutModule } from "../layout/layout.module";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../@core/shared/shared.module";


@NgModule({
	declarations: [
		LitemoreComponent,
	],
	imports: [
		LitemoreRoutingModule,
		NgScrollbarModule,
		ScrollingModule,
		LayoutModule,
		TranslateModule,
		SharedModule
	]
})
export class LitemoreModule { }
