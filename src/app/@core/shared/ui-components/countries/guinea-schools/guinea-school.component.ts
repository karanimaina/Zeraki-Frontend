import {Component, ElementRef} from "@angular/core";
import {CountryViewsBaseComponent} from "../country-views-base.component";

@Component({
	selector: "ui-guinea-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.GUINEA_SCHOOL]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class GuineaSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-guinea-primary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.GUINEA_PRIMARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
		`
})
export class GuineaPrimarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-guinea-secondary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.GUINEA_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class GuineaSecondarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
