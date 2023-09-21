import { Component, ElementRef } from "@angular/core";
import { CountryViewsBaseComponent } from "../country-views-base.component";

@Component({
	selector: "ui-south-africa-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.SOUTH_AFRICA_PRIMARY, schoolTypes.SOUTH_AFRICA_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class SouthAfricaSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-south-africa-primary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.SOUTH_AFRICA_PRIMARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class SouthAfricaPrimarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-south-africa-secondary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.SOUTH_AFRICA_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class SouthAfricaSecondarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
