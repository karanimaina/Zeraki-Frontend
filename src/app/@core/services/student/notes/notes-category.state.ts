import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { APIStatus } from "src/app/@core/enums/api-status";
import { NotesService } from "./notes.service";

@Injectable({ providedIn: "root" })
export default class NotesCategoryState {
	constructor(
    private readonly _notesService: NotesService,
	) { }

	// notes categories
	private readonly _notesCategories$ = new BehaviorSubject<string[] | null>(null);
	private readonly _notesCategoriesStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _notesCategoriesMessage$ = new BehaviorSubject<string | null>(null);
	public notesCategories$ = this._notesCategories$.asObservable();
	public notesCategoriesStatus$ = this._notesCategoriesStatus$.asObservable();
	public notesCategoriesMessage$ = this._notesCategoriesMessage$.asObservable();

	public retrieveNotesCategories(studentID: number): void {
		this._notesCategoriesStatus$.next(APIStatus.LOADING);

		this._notesService.retrieveNoteCategories(studentID).subscribe({
			next: (response: string[]) => {
				this._notesCategories$.next(response);
				this._notesCategoriesStatus$.next(APIStatus.SUCCESS);
				this._notesCategoriesMessage$.next("Notes retrieved successfully");
			},
			error: (error: Error) => {
				console.log(error);
				this._notesCategoriesStatus$.next(APIStatus.ERROR);
				this._notesCategoriesMessage$.next(`${error}`);
			},
		});
	}
	public getNotesCategories(): string[] | null {
		return this._notesCategories$.value;
	}

}
