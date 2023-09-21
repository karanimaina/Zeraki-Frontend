import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-grading-system",
	templateUrl: "./grading-system.component.html",
	styleUrls: ["./grading-system.component.scss"]
})
export class GradingSystemComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	listGradingSys = true;
	createGradingSys = false;

	schoolData?: SchoolTypeData;

	constructor(
		private dataService: DataService,
	) { }

	ngOnInit(): void {
		this.loadSchoolData();
	}

	private loadSchoolData() {
		this.dataService.schoolData.subscribe((res) => {
			this.schoolData = res;
		});
	}

	showGsList() {
		this.listGradingSys = true;
		this.createGradingSys = false;
	}

	showCreateGs() {
		this.listGradingSys = false;
		this.createGradingSys = true;
	}

	onGradingSystemCreationSuccess() {
		this.showGsList();
	}

	get isSouthAfricanSchool() {
		return this.schoolData?.isSouthAfricaPrimarySchool || this.schoolData?.isSouthAfricaSecondarySchool;
	}

	get isMentionSchools() {
		return this.schoolData?.isGuineaSchool || this.schoolData?.isIvorianSchool || this.isSouthAfricanSchool;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
