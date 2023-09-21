import {Component, ElementRef} from "@angular/core";
import {CountryViewsBaseComponent} from "../country-views-base.component";

@Component({
	selector: "ui-kenyan-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.KCSE_SCHOOL,schoolTypes.KCPE_PRIMARY_SCHOOL, schoolTypes.IGCSE_SCHOOL]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class KenyanSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-kcpe-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.KCPE_PRIMARY_SCHOOL]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
		`
})
export class KcpeSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-kcse-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.KCSE_SCHOOL]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class KcseSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}

@Component({
	selector: "ui-igcse-school",
	template: `
		<ng-container *appSchoolAccess="[schoolTypes.IGCSE_SCHOOL]">
			<ng-container *ngTemplateOutlet="template">
				<ng-content></ng-content>
			</ng-container>
		</ng-container>
	`
})
export class IgcseSchoolComponent extends CountryViewsBaseComponent {
	constructor(element: ElementRef) {
		super(element);
	}
}
