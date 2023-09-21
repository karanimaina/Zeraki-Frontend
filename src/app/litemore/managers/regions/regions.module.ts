import { NgModule } from "@angular/core";

import { RegionsRoutingModule } from "./regions-routing.module";
import { RegionsComponent } from "./regions.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { RegionListComponent } from "./pages/region-list/region-list.component";
import { RegionAdditionModalComponent } from "./components/region-addition-modal/region-addition-modal.component";
import { RegionUpdateModalComponent } from "./components/region-update-modal/region-update-modal.component";


@NgModule({
	declarations: [
		RegionsComponent,
		RegionListComponent,
		RegionAdditionModalComponent,
		RegionUpdateModalComponent
	],
	imports: [
		SharedModule,
		RegionsRoutingModule
	]
})
export class RegionsModule { }
