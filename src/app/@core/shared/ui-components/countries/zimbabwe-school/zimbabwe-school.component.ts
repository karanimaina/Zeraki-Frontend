import {Component, ElementRef} from "@angular/core";
import {CountryViewsBaseComponent} from "../country-views-base.component";

@Component({
	selector: "ui-zimbabwe-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.ZIMBABWE_PRIMARY, schoolTypes.ZIMBABWE_SECONDARY, schoolTypes.ZIMBABWE_IGCSE]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class ZimbabweSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-zimbabwe-primary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.ZIMBABWE_PRIMARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
		`
})
export class ZimbabwePrimarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-zimbabwe-secondary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.ZIMBABWE_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class ZimbabweSecondarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-zimbabwe-igcse-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.ZIMBABWE_IGCSE]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class ZimbabweIGCSESchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

