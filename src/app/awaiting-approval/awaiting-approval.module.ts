import { NgModule } from "@angular/core";

import { AwaitingApprovalRoutingModule } from "./awaiting-approval-routing.module";
import { AwaitingApprovalComponent } from "./awaiting-approval.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgScrollbarModule } from "ngx-scrollbar";
import { LayoutModule } from "../layout/layout.module";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../@core/shared/shared.module";


@NgModule({
	declarations: [
		AwaitingApprovalComponent
	],
	imports: [
		AwaitingApprovalRoutingModule,
		NgScrollbarModule,
		ScrollingModule,
		LayoutModule,
		SharedModule,
		TranslateModule,

	]
})
export class AwaitingApprovalModule { }
