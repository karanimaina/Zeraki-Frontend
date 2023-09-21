import {Component, ElementRef} from "@angular/core";
import {CountryViewsBaseComponent} from "../country-views-base.component";

@Component({
	selector: "ui-uganda-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.OLEVEL_SCHOOL]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class UgandaSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
