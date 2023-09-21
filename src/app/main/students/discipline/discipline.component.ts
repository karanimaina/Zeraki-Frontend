import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject, Subscription } from "rxjs";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { StudentNote, StudentOldNote } from "src/app/@core/models/notes/note";
import { OlevelAcademicYear } from "src/app/@core/models/olevel/olevel-academic-year";
import { OlevelTerm } from "src/app/@core/models/olevel/olevel-term";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { APIStatus } from "src/app/@core/enums/api-status";
import { OLEVEL_TERMS } from "src/app/@core/shared/utilities/olevel-terms";
import Swal from "sweetalert2";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { EvaluationService } from "src/app/@core/services/exams/evaluations/evaluation.service";
import NotesCategoryState from "src/app/@core/services/student/notes/notes-category.state";
import { NotesService } from "src/app/@core/services/student/notes/notes.service";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-discipline",
	templateUrl: "./discipline.component.html",
	styleUrls: ["./discipline.component.scss"]
})
export class DisciplineComponent implements OnInit, OnDestroy {
	messages: any;
	routeId: any;
	student: any;
	sendTextMessage = false;

	first?: number;
	last?: number;
	total?: number;
	previous?: number;
	next?: number;
	page?: number;
	size?: number;

	sendEmail = false;
	image_path: any;
	action = 1;
	error_status = false;
	error_msg = "";
	user_roles: any;
	isBackup = false;
	schoolTypeData?: SchoolTypeData;

	category = "Discipline";
	academicYearId?: number;
	term?: number;
	isRetrievingDisciplineNotes = false;
	// isOnlyRetrievingDisciplineNotes = false;
	disciplineNotesSub?: Subscription;
	disciplineNotes?: any;
	newNotes: StudentNote[] = [];
	oldNotes: StudentOldNote[] = [];
	isAddingNote = false;
	addStudentNoteSub?: Subscription;
	selectedNote?: StudentNote;
	selectedOldNote?: StudentOldNote;
	isUpdatingNote = false;
	updateStudentNoteSub?: Subscription;
	isDeletingNote = false;
	deleteStudentDisciplineSub?: Subscription;

	destroyed$: Subject<boolean> = new Subject<boolean>();
	academicYears$!: Subscription;
	currentYear: any;
	academicYears: Array<{ ayid: number, name: string }> = [];
	isLoadingAcademicYears = false;
	readonly OLEVEL_TERMS = [...OLEVEL_TERMS];
	academicTerms: Array<OlevelTerm> = [];

	academicYearFilter?: number;
	termFilter?: number;
	typeFilter?: string;

	maxDescriptionTextLength = 115;
	currentDescriptionToAddTextLength = 0;
	currentDescriptionToUpdateTextLength = 0;
	descriptionToAddSub?: Subscription;
	descriptionToUpdateSub?: Subscription;

	get descriptionToAddTextCount(): string {
		return this.translate.instant("common.characterCount", { value: `${this.currentDescriptionToAddTextLength} / ${this.maxDescriptionTextLength}` });
	}

	get descriptionToUpdateTextCount(): string {
		return  this.translate.instant("common.characterCount", { value: `${this.currentDescriptionToUpdateTextLength} / ${this.maxDescriptionTextLength}` });
	}

	get isOnlyRetrievingDisciplineNotes(): boolean {
		return !this.isLoadingAcademicYears && this.isRetrievingDisciplineNotes;
	}

	get isLoading(): boolean {
		return (this.isLoadingAcademicYears || this.isRetrievingDisciplineNotes);
	}

	disciplineAdditionForm = this.fb.group({
		yearToAdd: [null, Validators.required],
		termToAdd: [null, Validators.required],
		typeToAdd: [null, Validators.required],
		titleToAdd: ["", Validators.required],
		descriptionToAdd: ["", [Validators.required, Validators.maxLength(this.maxDescriptionTextLength)]],
	});

	disciplineUpdateForm = this.fb.group({
		yearToUpdate: [null, Validators.required],
		termToUpdate: [null, Validators.required],
		typeToUpdate: [null, Validators.required],
		title: ["", Validators.required],
		description: ["", [Validators.required, Validators.maxLength(this.maxDescriptionTextLength)]],
	});

	requiredValidator = Validators.required;

	readonly APIStatus = APIStatus;
	notesCategoriesStatus$: Observable<APIStatus> = this.notesCategoryState.notesCategoriesStatus$;
	notesCategories$: Observable<string[] | null> = this.notesCategoryState.notesCategories$;
	notesCategoriesMessage$: Observable<string | null> = this.notesCategoryState.notesCategoriesMessage$;
	notesCategoriesSub!: Subscription;

	@ViewChild("modalCloseBtn", {read: ElementRef}) modalCloseBtn?: ElementRef;

	constructor(
		private dataService: DataService,
		private studentsService: StudentsService,
		private activatedRoute: ActivatedRoute,
		private rolesService: RolesService,
		private examService: ExamService,
		private evaluationService: EvaluationService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private notesService: NotesService,
		private notesCategoryState: NotesCategoryState,
		private fb: FormBuilder,
	) { }

	ngOnInit(): void {
		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");
		this.academicYearId = parseInt(this.activatedRoute.snapshot.queryParams.year);
		this.term = parseInt(this.activatedRoute.snapshot.queryParams.term);
		this.isBackup = this.dataService.getIsBackup();

		this.retrieveNotesCategories(+this.routeId);
		this.getStudentsProfile();
		this.getUserRoles();
		this.getAcademicTerms();
		this.getCurrentYearAndAcademicYears();
		this.checkSchoolAuthenticatedStatus();

		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});

		this.descriptionToAddSub = this.descriptionToAdd?.valueChanges.subscribe((value) => {
			this.currentDescriptionToAddTextLength = value?.length ?? 0;
		});

		this.descriptionToUpdateSub = this.description?.valueChanges.subscribe((value) => {
			this.currentDescriptionToUpdateTextLength = value?.length ?? 0;
		});
	}

	private retrieveNotesCategories(studentID: number) {
		this.notesCategoryState.retrieveNotesCategories(studentID);
	}

	private getStudentsProfile() {
		this.studentsService.getStudentsProfile(this.routeId).subscribe((resp: any) => {
			this.student = resp;

			this.setStudentPhoto();
		});
	}

	private setStudentPhoto() {
		this.image_path = this.dataService.getUserImage();

		if (this.student.url !== null && this.student.url.length > 0) {
			this.image_path = this.dataService.getUserImage(this.student.url);
		}
	}

	getUserRoles() {
		this.rolesService.roleSubject.subscribe(resp => {
			this.user_roles = resp;
		});
	}

	private getAcademicTerms() {
		this.academicTerms = this.OLEVEL_TERMS;
	}

	private getCurrentYearAndAcademicYears() {
		this.isLoadingAcademicYears = true;

		this.academicYears$ = this.examService.getCurrentYear()
			.pipe(
				tap((year) => this.currentYear = year),
				switchMap(() => this.getAcademicYears()),
				takeUntil(this.destroyed$)
			).subscribe(({ academicYears }) => {
				this.setAcademicYears(academicYears);
				this.isLoadingAcademicYears = false;

				this.setDefaultFilters();

				this.retrieveDisciplineNotes();
			});
	}

	private getAcademicYears() {
		return this.evaluationService.getAcademicYears();
	}

	private setAcademicYears(academicYears: OlevelAcademicYear[]) {
		this.academicYears = academicYears.map(({ academicYearId, beginYear }) => {
			return {
				ayid: academicYearId,
				name: beginYear.toString()
			};
		});
	}

	private setDefaultFilters() {
		if (this.academicYears.length > 0) {
			const foundAcademicYear = this.academicYears.find(({ name }) => name == this.currentYear);

			this.academicYearFilter = foundAcademicYear?.ayid;
			this.termFilter = this.academicTerms[0].value;
		}
	}

	checkSchoolAuthenticatedStatus() {
		this.dataService.getUserInitialization().subscribe(resp => {
			const user_init: any = resp;
			if (!user_init.school_validity_info?.is_valid_school) {
				// this.router.navigateByUrl("home");
			}
		});
	}

	onFilterChange() {
		this.retrieveDisciplineNotes();
	}

	private retrieveDisciplineNotes() {
		const studentId = +this.routeId;
		const category = this.typeFilter;
		const academicYearId = <number>this.academicYearId || this.academicYearFilter;
		const term = <number>this.term || this.termFilter;

		this.isRetrievingDisciplineNotes = true;
		// this.isOnlyRetrievingDisciplineNotes = true;

		this.disciplineNotesSub = this.notesService.retrieveStudentNotes(studentId, category, academicYearId, term, this.page).subscribe({
			next: (res: any) => {
				this.disciplineNotes = res;
				this.newNotes = res.newNotes.studentNotes;
				this.oldNotes = res.oldNotes?.messages || [];

				this.page = this.page || 0;
				this.first = res.newNotes.first,
				this.last = res.newNotes.last,
				this.total = res.newNotes.total,
				this.previous = res.newNotes.previous,
				this.next = res.newNotes.next,
				this.page = res.newNotes.page,
				this.size = res.newNotes.size,

				this.isRetrievingDisciplineNotes = false;
				// this.isOnlyRetrievingDisciplineNotes = false;
			},
			error: (err: any) => {
				console.log(err);
				this.isRetrievingDisciplineNotes = false;
				// this.isOnlyRetrievingDisciplineNotes = false;
			},
		});
	}

	toggleAction(action: any) {
		this.action = action;
	}

	cancelNewDiscipline() {
		this.resetStudentAdditionForm();
		this.toggleAction(1);
	}

	previousPage() {
		this.page = this.page! - 1;
		this.retrieveDisciplineNotes();
	}

	nextPage() {
		this.page = this.page! + 1;
		this.retrieveDisciplineNotes();
	}

	onNewCommentBtnClick() {
		this.prefillDisciplineAddForm();
		this.toggleAction(2);
	}

	private prefillDisciplineAddForm() {
		this.disciplineAdditionForm.patchValue({
			yearToAdd: this.academicYearFilter,
			termToAdd: this.termFilter,
			typeToAdd: this.typeFilter,
		});
	}

	setSelectedNote(note: StudentNote) {
		this.action = 3;
		this.selectedNote = note;
	}

	setSelectedOldNote(note: StudentOldNote) {
		this.action = 4;
		this.selectedOldNote = note;
	}

	prefillDisciplineUpdateForm() {
		const foundAcademicYear = this.academicYears.find(({ name }) => +name === this.selectedNote?.year);

		this.disciplineUpdateForm.patchValue({
			yearToUpdate: foundAcademicYear?.ayid,
			termToUpdate: this.selectedNote?.term,
			typeToUpdate: this.selectedNote?.category,
			title: this.selectedNote?.title,
			description: this.selectedNote?.note,
		});
	}

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	get yearToAdd(): AbstractControl | null {
		return this.disciplineAdditionForm.get("yearToAdd");
	}
	get termToAdd(): AbstractControl | null {
		return this.disciplineAdditionForm.get("termToAdd");
	}
	get typeToAdd(): AbstractControl | null {
		return this.disciplineAdditionForm.get("typeToAdd");
	}
	get titleToAdd(): AbstractControl | null {
		return this.disciplineAdditionForm.get("titleToAdd");
	}
	get descriptionToAdd(): AbstractControl | null {
		return this.disciplineAdditionForm.get("descriptionToAdd");
	}

	onDisciplineAdditionFormSubmit() {
		const form = this.disciplineAdditionForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const payload: any = {
			studentId: +this.routeId,
			academicYearId: form.value["yearToAdd"],
			term: form.value["termToAdd"],
			category: form.value["typeToAdd"],
			title: form.value["titleToAdd"],
			note: form.value["descriptionToAdd"],
		};

		// console.log(payload);
		this.addStudentNoteConfirmation(payload);
	}

	private async addStudentNoteConfirmation(payload: any) {
		const swalResult = await Swal.fire({
			title: this.translate.instant("students.discipline.swal.title"),
			text: this.translate.instant("students.discipline.swal.text"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		});

		if (swalResult.isConfirmed) this.addStudentNote(payload);
	}

	private addStudentNote(payload: any) {
		this.isAddingNote = true;

		this.addStudentNoteSub = this.notesService.addStudentNote(payload).subscribe({
			next: () => {
				this.isAddingNote = false;

				const successMsg = this.translate.instant("students.discipline.toastMessages.caseSaveSuccess");
				this.toastService.success(successMsg);

				this.toggleAction(1);
				this.resetStudentAdditionForm();
				this.resetPagination();

				this.setFilters(payload["academicYearId"], payload["term"], payload["category"]);
				this.retrieveDisciplineNotes();
			},
			error: (err: any) => {
				console.log(err);

				this.isAddingNote = false;

				const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred2");
				this.toastService.error(errorMsg);
			},
		});
	}

	private resetStudentAdditionForm() {
		this.disciplineAdditionForm.reset();
	}

	private resetPagination() {
		this.page = 0;
	}

	private setFilters(academicYearFilter?: number, termFilter?: number, typeFilter?: string) {
		this.academicYearFilter = academicYearFilter;
		this.termFilter = termFilter;
		this.typeFilter = typeFilter;
	}

	get yearToUpdate(): AbstractControl | null {
		return this.disciplineUpdateForm.get("yearToUpdate");
	}
	get termToUpdate(): AbstractControl | null {
		return this.disciplineUpdateForm.get("termToUpdate");
	}
	get typeToUpdate(): AbstractControl | null {
		return this.disciplineUpdateForm.get("typeToUpdate");
	}
	get title(): AbstractControl | null {
		return this.disciplineUpdateForm.get("title");
	}
	get description(): AbstractControl | null {
		return this.disciplineUpdateForm.get("description");
	}

	onDisciplineUpdateSubmit() {
		const form = this.disciplineUpdateForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const payload: any = {
			studentId: +this.routeId,
			academicYearId: form.value["yearToUpdate"],
			term: form.value["termToUpdate"],
			category: form.value["typeToUpdate"],
			title: form.value["title"],
			note: form.value["description"],
			// category: this.selectedNote?.category,
			noteId: this.selectedNote?.noteId,
		};

		this.updateStudentNote(payload);
	}

	updateStudentNote(payload: any) {
		this.isUpdatingNote = true;

		this.updateStudentNoteSub = this.notesService.updateStudentNote(payload).subscribe({
			next: () => {
				this.isUpdatingNote = false;
				this.selectedNote = <StudentNote>{...this.selectedNote, ...payload};

				// const foundNoteIndex = this.newNotes.findIndex(note => note.noteId === this.selectedNote?.noteId);
				// if (foundNoteIndex !== -1) this.newNotes.splice(foundNoteIndex, 1, this.selectedNote);

				this.setFilters(payload["academicYearId"], payload["term"], payload["category"]);
				this.retrieveDisciplineNotes();

				this.closeUpdateModal();

				const successMsg = this.translate.instant("students.discipline.toastMessages.caseUpdateSuccess");
				this.toastService.success(successMsg);
			},
			error: (err: any) => {
				console.log(err);

				this.isUpdatingNote = false;

				const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred2");
				this.toastService.error(errorMsg);
			},
		});
	}

	closeUpdateModal() {
		this.modalCloseBtn?.nativeElement?.click();
	}

	async deleteStudentNoteConfirmation(note?: StudentNote) {
		const swalResult = await Swal.fire({
			title: this.translate.instant("students.discipline.swal.deleteDisciplineTitle"),
			text: this.translate.instant("students.discipline.swal.deleteDisciplineText", { title: note?.title }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			focusCancel: true
		});

		if (swalResult.isConfirmed) {
			if (note) this.deleteStudentNote(note.noteId);
		}
	}

	deleteStudentNote(noteId: number) {
		this.isDeletingNote = true;

		this.deleteStudentDisciplineSub = this.notesService.deleteStudentNote(noteId).subscribe({
			next: () => {
				this.isDeletingNote = false;

				const successMsg = this.translate.instant("students.discipline.toastMessages.caseDeleteSuccess");
				this.toastService.success(successMsg);

				this.newNotes = this.newNotes.filter(note => note.noteId !== noteId);
				this.toggleAction(1);
			},
			error: (err: any) => {
				console.log(err);

				this.isDeletingNote = false;

				const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred2");
				this.toastService.error(errorMsg);
			},
		});
	}

	ngOnDestroy(): void {
		this.disciplineNotesSub?.unsubscribe();
		this.addStudentNoteSub?.unsubscribe();
		this.updateStudentNoteSub?.unsubscribe();
		this.deleteStudentDisciplineSub?.unsubscribe();
		this.notesCategoriesSub?.unsubscribe();
		this.descriptionToAddSub?.unsubscribe();
		this.descriptionToUpdateSub?.unsubscribe();
		this.modalCloseBtn?.nativeElement.click();
		this.destroyed$.next(true);
		this.destroyed$.unsubscribe();
	}

}
