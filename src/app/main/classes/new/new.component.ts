import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { forkJoin, of, Subject } from "rxjs";
import { SubjectCategory } from "../../../@core/models/subject/subject-category";
import { catchError, takeUntil } from "rxjs/operators";
import { Intake } from "../../../@core/models/intake/intake";
import { ClassSubject } from "../../../@core/models/subject/class-subject";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

interface StreamDetails {
	form: number
	graduation_year: number
	intakeid: number
	name: string
	stream: string
	streamid: number
}

@Component({
	selector: "app-new",
	templateUrl: "./new.component.html",
	styleUrls: ["./new.component.scss"]
})
export class NewComponent implements OnInit, OnDestroy {
	@Input() schoolSetup = false;
	@Output() classCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
	private SOCIAL_STUDIES_AND_RE = 281;
	destroy$: Subject<boolean> = new Subject<boolean>();

	streamId!: number;
	selectedForm!: any;
	schoolTypeData!: SchoolTypeData;
	subjects: ClassSubject[] = [];
	subjectCategories: SubjectCategory[] = [];
	newCurriculum!: { class_limit: number, subjects: any[], newCurriculum: Array<string> };
	defaultSelectedSubjects: number[] = [443, 565];
	intakes: Intake[] = [];

	newClassForm: FormGroup = this.fb.group({
		form: [null, Validators.required],
		stream: ["", Validators.required],
		categories: this.fb.array([])
	});

	updateStreamSubjects = false;
	streamDetails!: StreamDetails;
	private streamSubjects!: ClassSubject[];

	creatingClass = false;
	streamDetailsLoading = false;
	subjectDetailsLoading = false;
	showSuccessMessageCard = false;
	addedStream!: { form: number; name: string };

	constructor(
		private summaryService: SummaryService,
		private dataService: DataService,
		private classesService: ClassesService,
		private responseHandler: ResponseHandlerService,
		private activatedRoute: ActivatedRoute,
		public _location: Location,
		private fb: FormBuilder) { }

	ngOnInit(): void {
		this.getRouteParams();
		this.getSchoolTypeData();
		this.watchNewClassFormChanges();
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	private getRouteParams() {
		this.activatedRoute.params.subscribe(params => {
			this.streamId = params.streamid;
			this.initializePageData();
			if (this.streamId) {
				this.updateStreamSubjects = true;
				this.getStreamDetailsAndSubjects();
			}
		});
	}

	private initializePageData() {
		if (this.streamId) {
			this.getStreamDetailsAndSubjects();
		} else {
			this.getSubjectAndSubjectCategoriesAndIntakes();
		}
	}

	private getStreamDetailsAndSubjects() {
		this.streamDetailsLoading = true;
		forkJoin([
			this.classesService.getBasicDetailsStream(this.streamId),
			this.classesService.getStreamSubjects(this.streamId)
		])
			.pipe(takeUntil(this.destroy$))
			.subscribe(([streamDetails, streamSubjects]) => {
				this.streamDetailsLoading = false;
				this.streamDetails = streamDetails;
				this.streamSubjects = streamSubjects;

				this.getSubjectAndSubjectCategoriesAndIntakes();
			}, () => {
				this.streamDetailsLoading = false;
			});
	}

	private getSubjectAndSubjectCategoriesAndIntakes() {
		this.subjectDetailsLoading = true;
		forkJoin([
			this.classesService.getSubjects().pipe(catchError(e => of(e))),
			this.classesService.getSubjectsNewCurriculum().pipe(catchError(e => of(e))),
			this.classesService.getForms_All_WithIntakeIds().pipe(catchError(e => of(e))),
		])
			.pipe(takeUntil(this.destroy$))
			.subscribe(([subjects, newCurriculum, forms]) => {
				this.subjectDetailsLoading = false;
				this.newCurriculum = newCurriculum;
				this.intakes = forms;

				const newCurriculumSubjects = newCurriculum?.subjects || [];
				const allSubjects = [...subjects.subjects, ...newCurriculumSubjects];

				this.setSubjects(subjects.subjects);
				this.setSubjectCategories(allSubjects);
				this.setDefaultFormAndStreamName();
			}, () => {
				this.subjectDetailsLoading = false;
			});
	}

	private setSubjects(subjects) {
		const defaultSubjects = subjects
			.filter(subject => subject.intCode != this.SOCIAL_STUDIES_AND_RE)
			.map(subject => ({
				intCode: subject.intCode,
				name: subject.name,
				subjectId: subject.subjectId,
				textCode: subject.textCode,
				categoryId: subject.category.id
			}));

		const newCurriculumSubjects = this.newCurriculum?.subjects
			.filter(subject => !defaultSubjects.some(s => s.subjectId == subject.subjectId))
			.map(subject => ({
				intCode: subject.intCode,
				name: subject.name,
				subjectId: subject.subjectId,
				textCode: subject.textCode,
				categoryId: subject.category.id,
				newCurriculum: true
			}));

		this.subjects = [...defaultSubjects, ...newCurriculumSubjects];
	}

	private setSubjectCategories(tempSubjects) {
		const subjectCategories = tempSubjects.map(subject => subject.category);
		subjectCategories.forEach((category) => {
			const categoryExists = this.subjectCategories.some(c => c.id == category.id);
			if (!categoryExists) {
				this.subjectCategories.push(category);
			}
		});

		this.subjectCategories.sort((a, b) => a.id - b.id);

		this.updateSubjectsForEachCategory();
	}

	private updateSubjectsForEachCategory() {
		this.subjectCategories.forEach(category => {
			category["subjects"] = this.subjects
				.filter(sub => sub.categoryId == category.id)
				.filter(sub => !sub.newCurriculum || (sub.newCurriculum && this.newCurriculum?.newCurriculum.includes(this.selectedForm?.classlevel)));
		});

		this.createSubjectCategoriesFormControls();
	}

	private createSubjectCategoriesFormControls() {
		this.categoriesFormArray.clear();
		for (const category of this.subjectCategories) {
			const subjectsFormArray = this.fb.array([]);
			for (const subject of category.subjects) {
				const subjectFormGroup = this.fb.group({
					[subject.subjectId]: this.subjectSelectedByDefault(subject)
				});

				subjectsFormArray.push(subjectFormGroup);
			}

			this.categoriesFormArray.push(subjectsFormArray);
		}
	}

	private get categoriesFormArray() {
		return this.newClassForm.get("categories") as FormArray;
	}

	private subjectSelectedByDefault(subject: ClassSubject) {
		enum ClassSubjectCategory {
			TECHNICALS = 5,
			OPTIONALS = 6,
			LOCAL_LANGUAGES = 23,
			GHANAIAN_LANGUAGE = 24,
			BASIC_DESIGN_AND_TECHNOLOGY = 25,
			KINDERGATEN = 26,
		}

		const categoriesToUncheck = [
			ClassSubjectCategory.TECHNICALS,
			ClassSubjectCategory.OPTIONALS,
			ClassSubjectCategory.LOCAL_LANGUAGES,
			ClassSubjectCategory.GHANAIAN_LANGUAGE,
			ClassSubjectCategory.BASIC_DESIGN_AND_TECHNOLOGY,
			ClassSubjectCategory.KINDERGATEN,
		];

		const isInUncheckedCategory = categoriesToUncheck.some(categoryId => categoryId === subject.categoryId);
		const isCompulsory = this.schoolTypeData?.compulsory_subject_int_codes?.includes(subject.intCode);
		const isInDefaultSelectedSubjects = this.defaultSelectedSubjects.includes(subject.intCode);
		const isInStreamSubjects = this.streamSubjects?.some(s => s.subjectId == subject.subjectId);

		return this.updateStreamSubjects
			? isInStreamSubjects
			: (!isInUncheckedCategory || isCompulsory || isInDefaultSelectedSubjects);
	}

	private setDefaultFormAndStreamName() {
		const defaultForm = this.intakes.find(intake => intake.classlevel == this.streamDetails?.form);
		this.newClassForm.patchValue({
			form: defaultForm,
			stream: this.streamDetails?.name,
		});
	}

	private watchNewClassFormChanges() {
		this.newClassForm.get("form")?.valueChanges.subscribe((selectedForm) => {

			this.selectedForm = selectedForm;
			this.updateSubjectsForEachCategory();
		});
	}

	getSubjectFormControl(subject, categoryIndex, subjectIndex) {
		const categoryFormArray = this.categoriesFormArray.controls[categoryIndex] as FormArray;
		const subjectFormGroup = categoryFormArray.controls[subjectIndex] as FormGroup;

		if (this.subjectDisabledByDefault(subject))
			subjectFormGroup.disable();
		else
			subjectFormGroup.enable();
		return subjectFormGroup.controls[subject.subjectId] as FormControl;
	}

	private subjectDisabledByDefault(subject: ClassSubject) {
		const isInStreamSubjects = this.streamSubjects?.some(s => s.subjectId == subject.subjectId);
		const isInCompulsorySubjects = this.schoolTypeData?.compulsory_subject_int_codes?.includes(subject.intCode);

		if (this.newCurriculum?.newCurriculum?.includes(this.selectedForm)) {
			const newCurriculumSubjectCodes = this.subjects
				.filter(subject => subject.newCurriculum)
				.map(subject => subject.intCode);

			const isCompulsoryNewCurriculum = newCurriculumSubjectCodes.includes(subject.intCode) && isInCompulsorySubjects;

			return this.updateStreamSubjects ? isInStreamSubjects : isCompulsoryNewCurriculum;
		}

		return this.updateStreamSubjects ? isInStreamSubjects : isInCompulsorySubjects;
	}

	addClass() {
		this.newClassForm.markAllAsTouched();

		if (this.newClassForm.invalid) return;

		const { form, stream } = this.newClassForm.value;
		const selectedSubjects = this.selectedSubjectIds;

		const streamDetails = {
			intakeId: this.streamDetails?.intakeid,
			streamId: this.streamDetails?.streamid
		};

		const streamPayload = {
			streamName: stream,
			form: form.classlevel,
			subjectIds: selectedSubjects,
		};

		this.creatingClass = true;
		this.classesService.addNewClass(streamDetails, streamPayload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.newClassForm.markAsUntouched();
					this.newClassForm.patchValue({
						stream: ""
					});

					this.addedStream = {
						form: form.classlevel,
						name: stream,
					};
					this.creatingClass = false;
					this.showSuccessMessageCard = true;
				},
				error: (err) => {
					this.creatingClass = false;
					this.responseHandler.error(err, "addClass()");
					if (this.schoolSetup) {
						this.classCreated.emit(false);
					}
				},
				complete: () => {
					this.summaryService.setSchoolSummary();
					this.dataService.setSchoolTypeData();
					if (this.schoolSetup) {
						this.classCreated.emit(true);
					}
				}
			});
	}

	private get selectedSubjectIds() {
		const formValues = this.categoriesFormArray.getRawValue();

		const subjects: any[] = formValues.reduce((accumulator, value) => accumulator.concat(value), []);

		return subjects
			.filter(subject => Object.values(subject).every(value => value))
			.map((subject) => Number(Object.keys(subject)[0]));
	}

	get loading() {
		return this.subjectDetailsLoading || this.streamDetailsLoading;
	}

	closeSuccessMessageCard() {
		this.showSuccessMessageCard = !this.showSuccessMessageCard;
		if (this.updateStreamSubjects)
			this.initializePageData();
	}
}
