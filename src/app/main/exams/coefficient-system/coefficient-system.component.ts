import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Major } from "../../../@core/models/major/major";
import { CoefficientSystem } from "../../../@core/models/major/subject-weight-preset";
import { MajorService } from "../../../@core/services/classes/majors/major.service";
import { SubjectCoefficient } from "../../../@core/models/major/subject-coefficient";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import {CoefficientViewComponent} from "../components/coefficient-view/coefficient-view.component";

@Component({
	selector: "app-coefficient-system",
	templateUrl: "./coefficient-system.component.html",
	styleUrls: ["./coefficient-system.component.scss"]
})
export class CoefficientSystemComponent implements OnInit, OnDestroy {
	@ViewChild(CoefficientViewComponent) coefficientViewComponent?:CoefficientViewComponent;
	destroy$: Subject<boolean> = new Subject<boolean>();
	schoolTypeData!: SchoolTypeData;
	majors: Major[] = [];
	selectedMajor!: Major;
	coefficientSystem!: CoefficientSystem;
	subjectCoefficients: SubjectCoefficient[] = [];
	loadingMajors = true;
	loadingPresets = true;

	constructor(
		private toastService: HotToastService,
		private majorService: MajorService,
		private translate: TranslateService,
		private dataService: DataService) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.getMajors();
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData
			.pipe(takeUntil(this.destroy$))
			.subscribe((schoolData) => {
				this.schoolTypeData = schoolData;
			});
	}

	private getMajors() {
		this.majorService.getMajors()
			.pipe(takeUntil(this.destroy$))
			.subscribe(({ majors }) => {
				this.loadingMajors = false;
				this.majors = majors;
			}, () => {
				this.loadingMajors = false;
			});
	}


	getSubjectWeightPresets(majorId) {
		this.loadingPresets = true;
		this.majorService.getSubjectWeightPresets(majorId)
			.pipe(takeUntil(this.destroy$))
			.subscribe((coefficientSystem) => {
				this.loadingPresets = false;
				this.coefficientSystem = coefficientSystem;
				this.subjectCoefficients = coefficientSystem.coefficients;
			}, () => {
				this.loadingPresets = false;
			});
	}

	saveSubjectWeightPresetChanges(event) {
		const subjectCoefficient = event.subjectCoefficient;
		const form = event.form;
		this.majorService.updateSubjectWeightPresets(form.value)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.toastService.success(this.translate.instant("exams.coefficientSystem.editSuccess"));
				this.coefficientViewComponent?.effectChanges(subjectCoefficient,form.value);

			}, (error) => {
				this.coefficientViewComponent?.toggleSavingRowStatus(subjectCoefficient,false);
				const errorMessage = error.error?.response?.message || this.translate.instant("exams.coefficientSystem.editError");
				this.toastService.error(errorMessage);
			});
	}
}
