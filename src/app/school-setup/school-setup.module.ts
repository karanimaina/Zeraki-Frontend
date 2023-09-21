import { NgModule } from "@angular/core";

import { SchoolSetupRoutingModule } from "./school-setup-routing.module";
import * as setup from "./index";
import { SharedModule } from "../@core/shared/shared.module";
import { LayoutModule } from "../layout/layout.module";
import { MatStepperModule } from "@angular/material/stepper";
import { ClassesModule } from "../main/classes/classes.module";
import { StudentsModule } from "../main/students/students.module";
import { TeachersModule } from "../main/teachers/teachers.module";
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
	declarations: [
		setup.SchoolSetupComponent,
		setup.SetupWelcomeComponent,
		setup.SetupWizardComponent
	],
	imports: [
		SchoolSetupRoutingModule,
		SharedModule,
		LayoutModule,
		MatStepperModule,
		ClassesModule,
		StudentsModule,
		TeachersModule,
		TranslateModule
	]
})
export class SchoolSetupModule { }
