import { NgModule } from "@angular/core";

import { MeritListRoutingModule } from "./merit-list-routing.module";
import { MeritListComponent } from "./merit-list.component";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [MeritListComponent],
	imports: [
		MeritListRoutingModule,
		FormsModule,
		NgSelectModule,
		SharedModule,
	]
})
export class MeritListModule { }
