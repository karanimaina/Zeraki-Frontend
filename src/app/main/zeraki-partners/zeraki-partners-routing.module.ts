import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ZerakiPartnersComponent } from "./zeraki-partners.component";

const routes: Routes = [
	{
		path:"", component:ZerakiPartnersComponent
   
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ZerakiPartnersRoutingModule { }
