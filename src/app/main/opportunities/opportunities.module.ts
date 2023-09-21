import { NgModule } from "@angular/core";

import { OpportunitiesRoutingModule } from "./opportunities-routing.module";
import * as opps from "./index";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgSelectModule } from "@ng-select/ng-select";
import { MatchComponent } from "./match/match.component";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/@core/shared/shared.module";



@NgModule({
	declarations: [
		opps.OpportunitiesComponent,
		opps.OppsTopNavComponent,
		opps.VacanciesComponent,
		opps.SwapComponent,
		MatchComponent,
		opps.AddSwapComponent
	],
	imports: [
		FormsModule,
		ReactiveFormsModule,
		OpportunitiesRoutingModule,
		NgSelectModule,
		MatStepperModule,
		MatFormFieldModule,
		MatInputModule,
		TranslateModule,
		SharedModule,
	]
})
export class OpportunitiesModule { }
