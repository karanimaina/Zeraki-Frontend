import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";

@Component({
	selector: "app-grading-system-details",
	templateUrl: "./grading-system-details.component.html",
	styleUrls: ["./grading-system-details.component.scss"]
})
export class GradingSystemDetailsComponent {
  @Input() schoolData?: SchoolTypeData;
	@Input() isMentionSchool?: boolean = false;
  @Input() gradingSystem: any;

	@Output() onCloseGradingSystemDetails = new EventEmitter<void>();

	closeGradingSystemDetails() {
		this.onCloseGradingSystemDetails.emit();
	}

	get isZimbabweSchool() {
		return this.schoolData?.isZimbabwePrimarySchool || this.schoolData?.isZimbabweSecondarySchool || this.schoolData?.isZimbabweIgcse;
	}

	get isGhanaSchool() {
		return (
			this.schoolData?.isGhanaJuniorSchool ||
			this.schoolData?.isGhanaPrimarySchool ||
			this.schoolData?.isGhanaPrimaryJuniorSchool ||
			this.schoolData?.isGhanaSeniorSchool
		);
	}

	get isZambiaSchool() {
		return this.schoolData?.isZambiaPrimarySchool || this.schoolData?.isZambiaSecondarySchool;
	}

	get showPoints() {
		return !this.schoolData?.isTanzaniaPrimary && !this.isGhanaSchool;
	}

	get showGPA() {
		return this.isZimbabweSchool || this.isZambiaSchool || this.isGhanaSchool;
	}

	get showDescription() {
		return this.isZambiaSchool || this.isGhanaSchool;
	}
}
