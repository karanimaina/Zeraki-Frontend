import {Component, OnInit, ViewChild} from "@angular/core";
import {takeUntil} from "rxjs/operators";
import {DataService} from "../../../../@core/shared/services/data/data.service";
import {Subject} from "rxjs";
import {SchoolTypeData} from "../../../../@core/models/school-type-data";
import {Major} from "../../../../@core/models/major/major";
import {CoefficientSystem} from "../../../../@core/models/major/subject-weight-preset";
import {SubjectCoefficient} from "../../../../@core/models/major/subject-coefficient";
import {HotToastService} from "@ngneat/hot-toast";
import {MajorService} from "../../../../@core/services/classes/majors/major.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {CoefficientViewComponent} from "../../components/coefficient-view/coefficient-view.component";


@Component({
	selector: "app-exam-coefficient",
	templateUrl: "./exam-coefficient.component.html",
	styleUrls: ["./exam-coefficient.component.scss"],
})
export class ExamCoefficientComponent implements OnInit {
	@ViewChild(CoefficientViewComponent) coefficientViewComponent?: CoefficientViewComponent;
	destroy$: Subject<boolean> = new Subject<boolean>();
	params: any;
	intakeId = -1;
	seriesId = -1;
	egroupId = -1;
	annualEgroupId = -1;

	schoolTypeData!: SchoolTypeData;
	majors: Array<Major> = [];
	selectedMajor?: Major;
	coefficientSystem!: CoefficientSystem;
	subjectCoefficients: Array<SubjectCoefficient> = [];
	loadingMajors = true;
	loadingPresets = true;

	constructor(
		private activatedRoute: ActivatedRoute,
		private toastService: HotToastService,
		private majorService: MajorService,
		private translate: TranslateService,
		private dataService: DataService) {
	}

	ngOnInit(): void {
		const params = this.activatedRoute.snapshot.params;
		this.intakeId = params.intakeId || -1;
		this.seriesId = params.seriesId || -1;


		this.getSchoolTypeData();
		this.getSubjectCoefficients(null!, true);
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

	getSubjectCoefficients(majorId?: number, firstTime = false) {
		this.loadingPresets = this.loadingMajors = true;
		this.majorService.getSubjectPresets( this.intakeId, this.seriesId, majorId).subscribe((res: any) => {
			if (firstTime) {
				this.majors = res.majors;
				this.selectedMajor = this.majors[0];
			}
			this.coefficientSystem = res;
			this.subjectCoefficients = res.coefficients;
			this.loadingPresets = this.loadingMajors = false;

		}, (err) => {
			this.loadingPresets = this.loadingMajors = false;
		});
	}

	saveSubjectWeightPresetChanges(event) {
		const subjectCoefficient = event.subjectCoefficient;
		const form = event.form.value;
		const post = form;

		post.weight = form.weights[0].weight || 1;
		post.seriesId = this.seriesId == -1 ? null : +this.seriesId;
		post.egroupId = this.egroupId == -1 ? null : +this.egroupId;
		post.intakeId = +this.intakeId;
		post.annualEgroupId = this.annualEgroupId == -1 ? null : +this.annualEgroupId;

		this.majorService.updateExamSubjectPreset(post)
			.pipe(takeUntil(this.destroy$))
			.subscribe((res:any) => {
				this.toastService.success(res.message);
				const weightObj = Object.keys(subjectCoefficient.classWeight);
				const newObj = {
					form:weightObj[0],
					weight:post.weight
				};
				const updatedValues = {...subjectCoefficient, weights:[newObj]};

				this.coefficientViewComponent?.effectChanges(subjectCoefficient, updatedValues);
			}, (error) => {
				this.coefficientViewComponent?.toggleSavingRowStatus(subjectCoefficient, false);
				const errorMessage = error.error?.response?.message || this.translate.instant("exams.coefficientSystem.editError");
				this.toastService.error(errorMessage);
			});


	}
}
