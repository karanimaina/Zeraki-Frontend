import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { APIStatus } from "src/app/@core/enums/api-status";
import NotesCategoryState from "src/app/@core/services/student/notes/notes-category.state";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-student-notes-items",
	templateUrl: "./student-notes-items.component.html",
	styleUrls: ["./student-notes-items.component.scss"]
})
export class StudentNotesItemsComponent implements OnInit, OnDestroy {
	@Input() studentID?: number;
	@Input() showDivider = true;

	schoolInfo?: SchoolInfo;
	schoolInfoSub?: Subscription;
	schoolTypeData?: SchoolTypeData;
	schoolTypeDataSub?: Subscription;

	notesCategoriesStatus$: Observable<APIStatus> = this.notesCategoryState.notesCategoriesStatus$;
	notesCategories$: Observable<string[] | null> = this.notesCategoryState.notesCategories$;

	constructor(
		private schoolService: SchoolService,
    private dataService: DataService,
		private notesCategoryState: NotesCategoryState,
	) { }

	ngOnInit(): void {
		this.getSchoolInfo();
		this.getSchoolTypeData();
	}

	getSchoolInfo() {
		this. schoolInfoSub = this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	getSchoolTypeData() {
		this.schoolTypeDataSub = this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}


	public get isTzSchool(): boolean {
		return !!this.schoolTypeData?.isTanzaniaPrimary || !!this.schoolTypeData?.isTanzaniaSecondary;
	}


	get displayComments(): boolean {
		if (this.schoolTypeData) {
			return this.schoolTypeData.isOLevelSchool || this.isTzSchool;
		}

		return false;
	}


	ngOnDestroy(): void {
		this.schoolInfoSub?.unsubscribe();
		this.schoolTypeDataSub?.unsubscribe();
	}
}
