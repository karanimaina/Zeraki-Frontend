import { NgModule } from "@angular/core";

import { CountiesRoutingModule } from "./counties-routing.module";
import { CountiesComponent } from "./counties.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { CountyListComponent } from "./pages/county-list/county-list.component";
import { CountiesFiltersComponent } from "./components/counties-filters/counties-filters.component";
import { CountyAdditionModalComponent } from "./components/county-addition-modal/county-addition-modal.component";
import { CountyUpdateModalComponent } from "./components/county-update-modal/county-update-modal.component";


@NgModule({
	declarations: [
		CountiesComponent,
		CountyListComponent,
		CountiesFiltersComponent,
		CountyAdditionModalComponent,
		CountyUpdateModalComponent
	],
	imports: [
		SharedModule,
		CountiesRoutingModule
	]
})
export class CountiesModule { }
