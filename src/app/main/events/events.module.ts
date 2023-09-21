import { NgModule } from "@angular/core";
import { DefaultMatCalendarRangeStrategy, MatDatepickerModule, MAT_DATE_RANGE_SELECTION_STRATEGY } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";


import { EventsRoutingModule } from "./events-routing.module";
import * as events from "./index";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { CKEditorModule } from "ckeditor4-angular";
import { FullCalendarModule } from "@fullcalendar/angular";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "@danielmoncada/angular-datetime-picker";
import { PdfViewerModule } from "ng2-pdf-viewer";


@NgModule({
	declarations: [
		events.EventsComponent,
		events.ManageEventsComponent,
		events.EventsTopNavComponent,
		events.NewsLetterComponent
	],
	imports: [
		FormsModule,
		SharedModule,
		EventsRoutingModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatFormFieldModule,
		MatInputModule,
		NgSelectModule,
		CKEditorModule,
		FullCalendarModule,
		OwlDateTimeModule,
		OwlNativeDateTimeModule,
		PdfViewerModule
	],
	providers: [
		{
			provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
			useClass: DefaultMatCalendarRangeStrategy,
		},
	],
})
export class EventsModule { }
