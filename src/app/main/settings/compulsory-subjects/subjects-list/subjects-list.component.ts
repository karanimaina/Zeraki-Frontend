import {Component, OnDestroy, OnInit} from "@angular/core";
import {
	CompulsorySubjectsService
} from "../../../../@core/services/settings/compulsory-subjects/compulsory-subjects.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ResponseHandlerService} from "../../../../@core/shared/services/response-handler/response-handler.service";
import {CompulsorySubject} from "../../../../@core/models/subject/compulsory-subject";
import Swal from "sweetalert2";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-subjects-list",
	templateUrl: "./subjects-list.component.html",
	styleUrls: ["./subjects-list.component.scss"]
})
export class SubjectsListComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	loadingCompulsorySubjects = true;
	compulsorySubjects: CompulsorySubject[] = [];

	constructor(
		private compulsorySubjectsService: CompulsorySubjectsService,
		private dataService: DataService,
		private responseHandler: ResponseHandlerService,
		private translate: TranslateService) {}

	ngOnInit(): void {
		this.getCompulsorySubjects();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	getCompulsorySubjects() {
		this.compulsorySubjectsService.getCompulsorySubjects()
			.pipe(takeUntil(this.destroy$))
			.subscribe((subjects) => {
				this.compulsorySubjects = subjects;
				this.loadingCompulsorySubjects = false;
			}, (error) => {
				this.loadingCompulsorySubjects = false;
				this.responseHandler.error(error, "getCompulsorySubjects()");
			});
	}

	showConfirmDialog(subject: CompulsorySubject) {
		Swal.fire({
			title: this.translate.instant("settings.subjectsList.swal.title"),
			text: this.translate.instant("settings.subjectsList.swal.text", {subjectName: subject.subjectName}),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("settings.subjectsList.swal.confirmButtonText"),
			cancelButtonText: this.translate.instant("settings.subjectsList.swal.cancelButtonText"),
		}).then((result) => {
			if (result.isConfirmed) {
				this.removeCompulsorySubject(subject);
			}
		});
	}

	private removeCompulsorySubject(subject: CompulsorySubject) {
		this.compulsorySubjectsService.removeCompulsorySubject(subject)
			.pipe(takeUntil(this.destroy$))
			.subscribe((response) => {
				this.responseHandler.success(response, "removeCompulsorySubject()");
				this.resetCompulsorySubjects(subject.subjectId);
			}, (error) => {
				this.responseHandler.error(error, "removeCompulsorySubject()");
			});
	}

	private resetCompulsorySubjects(subjectId: number) {
		this.compulsorySubjects = this.compulsorySubjects.filter((subject) => subject.subjectId !== subjectId);
		this.dataService.setSchoolTypeData();
	}
}
