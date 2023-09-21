import { NgModule } from "@angular/core";
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

import { MessagesRoutingModule } from "./messages-routing.module";
import * as messages from "./index";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { CurrencyPipe } from "@angular/common";
import { PdfViewerModule } from "ng2-pdf-viewer";


@NgModule({
	declarations: [
		messages.MessagesComponent,
		messages.ComposeComponent,
		messages.InboxComponent,
		messages.TrackComponent,
		messages.BuyComponent,
		messages.MessagesTopNavComponent,
		messages.MessagingGroupComponent,
		messages.ReceiptComponent,
		messages.ReadComponent,
		messages.OldComponent,
		messages.NewComponent,
		messages.OldTrackComponent,
		messages.NewTrackComponent,
		messages.MessageSentComponent,
		messages.AllStudentsOptionsComponent
	],
	imports: [
		FormsModule,
		NgSelectModule,
		SharedModule,
		MessagesRoutingModule,
		MatFormFieldModule,
		MatInputModule,
		MatStepperModule,
		MatChipsModule,
		MatIconModule,
		PdfViewerModule,
	],
	providers: [
		CurrencyPipe
	]
})
export class MessagesModule { }
