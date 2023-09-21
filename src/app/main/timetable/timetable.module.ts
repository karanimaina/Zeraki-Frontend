import { NgModule } from "@angular/core";

import { TimetableRoutingModule } from "./timetable-routing.module";
import { TimetableComponent } from "./timetable.component";
import { TimetableTopNavComponent } from "./timetable-top-nav/timetable-top-nav.component";
import { TeacherTimetableComponent } from "./teacher-timetable/teacher-timetable.component";
import { ClassTimetableComponent } from "./class-timetable/class-timetable.component";
import { FormsModule } from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		TimetableComponent,
		TimetableTopNavComponent,
		TeacherTimetableComponent,
		ClassTimetableComponent
	],
	imports: [
		FormsModule,
		TimetableRoutingModule,
		TranslateModule,
		SharedModule,
	]
})
export class TimetableModule { }
