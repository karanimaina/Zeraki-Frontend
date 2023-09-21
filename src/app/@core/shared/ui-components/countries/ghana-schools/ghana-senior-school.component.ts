import { Component, ElementRef } from "@angular/core";
import { CountryViewsBaseComponent } from "../country-views-base.component";

@Component({
	selector: "ui-ghana-senior-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.GHANA_SENIOR]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class GhanaSeniorSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
