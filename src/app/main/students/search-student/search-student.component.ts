import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { SchoolTypeCheckerService } from "src/app/@core/shared/services/school/school-type-checker/school-type-checker.service";
import { takeUntil } from "rxjs/operators";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";

class student {
	admno!: string;
	name!: string;
	phone!: number;
	upi!: string;
	indexNo!: number;
	intakeid!: number;
}

@Component({
	selector: "app-search-student",
	templateUrl: "./search-student.component.html",
	styleUrls: ["./search-student.component.scss"]
})
export class SearchStudentComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	admNoRadio = true;
	nameRadio = false;
	phoneNoRadio = false;
	upiRadio = false;
	indexNoRadio = false;
	student: student = new student();
	searchStudentsSuccessStatus = false;
	searchTerm = "";
	students: any[] = [];
	schoolTypeData?: SchoolTypeData;
	qparams = false;
	qTerm = "";

	constructor(
		private studentsService: StudentsService,
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private translate: TranslateService,
		private schoolTypeChecker: SchoolTypeCheckerService,
	) { }

	get isOlevelSchool(): boolean {
		return this.schoolTypeChecker.isOlevelSchool;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getSchoolTypeData();

		this.activatedRoute.queryParams
			.subscribe(params => {
				this.qTerm = params.stdNo;

				if (this.qTerm && this.qTerm != "") {
					this.qparams = true;
					this.doSearch();
				}
			}
			);
	}

	getSchoolTypeData() {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe(val => {
			this.schoolTypeData = val;
		});
	}

	toggleRadio(radio: string) {
		if (radio === "admNo") {
			this.admNoRadio = true;
			this.nameRadio = false;
			this.phoneNoRadio = false;
			this.upiRadio = false;
			this.indexNoRadio = false;
		} else if (radio === "name") {
			this.admNoRadio = false;
			this.nameRadio = true;
			this.phoneNoRadio = false;
			this.upiRadio = false;
			this.indexNoRadio = false;
		} else if (radio === "phoneNo") {
			this.admNoRadio = false;
			this.nameRadio = false;
			this.phoneNoRadio = true;
			this.upiRadio = false;
			this.indexNoRadio = false;
		} else if (radio === "upi") {
			this.admNoRadio = false;
			this.nameRadio = false;
			this.phoneNoRadio = false;
			this.upiRadio = true;
			this.indexNoRadio = false;
		} else if (radio === "indexNo") {
			this.admNoRadio = false;
			this.nameRadio = false;
			this.phoneNoRadio = false;
			this.upiRadio = false;
			this.indexNoRadio = true;
		}
	}

	doSearch() {
		this.searchStudentsSuccessStatus = false;
		this.searchTerm = "";
		let suffix = "";

		const admissionNumberTranslation = this.translate.instant("common.admno");

		if (this.qparams && this.admNoRadio) {
			suffix = `?admno=${this.qTerm}`;
			this.searchTerm = `${admissionNumberTranslation}: ${this.qTerm}`;
		}
		if (this.admNoRadio && !this.qparams) {
			suffix = `?admno=${this.student.admno}`;
			this.searchTerm = `${admissionNumberTranslation}: ${this.student.admno}`;
		}

		if (this.nameRadio) {
			suffix = `?name=${this.student.name}`;
			this.student.intakeid? suffix = `${suffix}&intakeid=${this.student.intakeid}`: "";
			const nameTranslation = this.translate.instant("common.name");
			this.searchTerm = `${nameTranslation}: ${this.student.name}`;
		}

		if (this.upiRadio) {
			suffix = `?upi=${this.student.upi}`;
			const upiTranslation = this.upiTranslation;
			this.searchTerm = `${upiTranslation}: ${this.student.upi}`;
		}

		if (this.phoneNoRadio) {
			suffix = `?phone=${this.student.phone}`;
			const phoneNumberTranslation = this.translate.instant("common.phoneNumber");
			this.searchTerm = `${phoneNumberTranslation}: ${this.student.phone}`;
		}

		if (this.indexNoRadio) {
			suffix = `?indexno=${this.student.indexNo}`;
			const indexNumberTranslation = this.translate.instant("common.indexNumber");
			this.searchTerm = `${indexNumberTranslation}: ${this.student.indexNo}`;
		}

		this.studentsService.searchStudent(suffix).pipe(takeUntil(this.destroy$)).subscribe(val => {
			this.students = val;
			this.searchStudentsSuccessStatus = true;
		});

		this.qparams = false;
		this.qTerm = "";
	}

	cancelSearch() {
		this.searchStudentsSuccessStatus = false;
		this.students = [];
	}

	get upiTranslation(): string {
		const upiTranslation = BasicUtils.upiTranslation(this.schoolTypeData);

		return upiTranslation;
	}

}
