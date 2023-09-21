import {Component, ElementRef} from "@angular/core";
import {CountryViewsBaseComponent} from "../country-views-base.component";

@Component({
	selector: "ui-ivory-coast-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.IVORY_COAST_PRIMARY, schoolTypes.IVORY_COAST_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class IvoryCoastSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-ivory-coast-primary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.IVORY_COAST_PRIMARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
		`
})
export class IvoryCoastPrimarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-ivory-coast-secondary-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.IVORY_COAST_SECONDARY]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class IvoryCoastSecondarySchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
