import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatStepper, StepperOrientation } from "@angular/material/stepper";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
	selector: "app-setup-wizard",
	templateUrl: "./setup-wizard.component.html",
	styleUrls: ["./setup-wizard.component.scss"]
})
export class SetupWizardComponent implements OnInit {
	stepperOrientation: Observable<StepperOrientation>;
	classCreated = false;
	@ViewChild("stepper") stepper!: MatStepper;

	constructor(
		private router: Router, 
		breakpointObserver: BreakpointObserver, 
		private _toast: HotToastService,
		private _translate: TranslateService) {
		this.stepperOrientation = breakpointObserver
			.observe("(min-width: 800px)")
			.pipe(map(({ matches }) => (matches ? "horizontal" : "vertical")));
	}

	ngOnInit(): void { }

	addClass(isCreated: boolean) {
		this.stepper.selected!.completed = isCreated;
		this.classCreated = isCreated;
		if (this.stepper.selected!.completed) {
			// move to next step
			this.stepper.next();
		}
	}

	showMessage(step: string) {
		switch (step) {
		case "class":
			this._toast.info(this._translate.instant("setup.classRequired"));
			break;
		case "student":
			this._toast.info(this._translate.instant("setup.studentRequired"));
			break;

		default:
			break;
		}
	}

	finish(){
		this.router.navigate(["/main/dashboard/welcome"]);
	}

}
