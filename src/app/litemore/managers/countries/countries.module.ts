import { NgModule } from "@angular/core";
import { CountriesRoutingModule } from "./countries-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatStepperModule } from "@angular/material/stepper";
import * as country from "./index";


@NgModule({
	declarations: [
		country.CountriesComponent,
		country.CountryListComponent,
		country.CountryAddComponent,
		country.AddCountryComponent,
		country.AddCompanyDetailsComponent,
		country.AddPaymentDetailsComponent,
		country.CountryViewComponent,
		country.CountryUpdateComponent,
		country.CountryStepperComponent
	],
	imports: [
		SharedModule,
		CountriesRoutingModule,
		MatStepperModule
	]
})
export class CountriesModule { }
