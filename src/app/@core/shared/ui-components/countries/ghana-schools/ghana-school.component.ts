import { Component, ElementRef } from "@angular/core";
import { CountryViewsBaseComponent } from "../country-views-base.component";

@Component({
	selector: "ui-ghana-school",
	template: `
		<ng-container *appSchoolAccess="ghanaSchools">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class GhanaSchoolComponent extends CountryViewsBaseComponent {
	ghanaSchools = [
		this.schoolTypes.GHANA_PRIMARY,
		this.schoolTypes.GHANA_PRIMARY_JUNIOR,
		this.schoolTypes.GHANA_JUNIOR,
		this.schoolTypes.GHANA_SENIOR
	];

	constructor(element: ElementRef) {
		super(element);
	}
}
