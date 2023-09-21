import {Component, ElementRef} from "@angular/core";
import {CountryViewsBaseComponent} from "../country-views-base.component";

@Component({
	selector: "ui-tanzania-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.TANZANIA_PRIMARY, schoolTypes.TANZANIA_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class TanzaniaSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-tanzania-primary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.TANZANIA_PRIMARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class TanzaniaPrimarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
@Component({
	selector: "ui-tanzania-secondary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.TANZANIA_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class TanzaniaSecondarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
