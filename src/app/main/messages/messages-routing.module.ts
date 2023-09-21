import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import *  as messages from "./index";
import { MessengerGuard } from "../../@core/shared/guards/messenger.guard";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";

const routes: Routes = [
	{
		path: "", component: messages.MessagesComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "buy", canActivate: [MessengerGuard], component: messages.BuyComponent },
			{ path: "receipt/:id", canActivate: [MessengerGuard], component: messages.ReceiptComponent },
			{ path: "inbox", component: messages.InboxComponent },
			{ path: "inbox/read/:id", component: messages.ReadComponent },
			{ path: "compose", canActivate: [MessengerGuard], component: messages.ComposeComponent },
			{ path: "track", canActivate: [MessengerGuard], component: messages.TrackComponent },
			{ path: "track/msggroup/:id", canActivate: [MessengerGuard], component: messages.MessagingGroupComponent },
			// { path: "track/msggroup/:id/:page", component: messages.MessagingGroupComponent },
			{ path: "", redirectTo: "inbox", pathMatch: "full" },
		]
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MessagesRoutingModule { }

