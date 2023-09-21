import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import * as events from "./index";

const routes: Routes = [
	{
		path : "", component: events.EventsComponent, canActivateChild: [NetworkGuard],
		children : [
			{ path: "manage", component: events.ManageEventsComponent },
			{ path: "newsletter", component: events.NewsLetterComponent },
			{ path: "", redirectTo: "manage", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EventsRoutingModule { }
