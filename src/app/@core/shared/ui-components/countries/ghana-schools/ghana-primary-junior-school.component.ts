import { Component, ElementRef } from "@angular/core";
import { CountryViewsBaseComponent } from "../country-views-base.component";

@Component({
	selector: "ui-ghana-primary-junior-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.GHANA_PRIMARY_JUNIOR]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class GhanaPrimaryJuniorSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
