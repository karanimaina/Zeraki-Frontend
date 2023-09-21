import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { Subjects } from "../../../../@core/models/classes/subject";

@Component({
	selector: "app-olevel-subjects",
	templateUrl: "./olevel-subjects.component.html",
	styleUrls: ["./olevel-subjects.component.scss"]
})
export class OlevelSubjectsComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();
	subjects: Subjects[] = [];
	isSyncingSubjects = false;

	constructor(private router: Router,
		private classesService: ClassesService,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.getSubjects();
	}

	viewTopics(subjectId: number) {
		this.router.navigate(["/main/classes/olevel/subjects/topics", subjectId]);
	}

	private getSubjects() {
		this.classesService.getSubjects().subscribe((res: any) => {
			this.subjects = res.subjects;
		});
	}

	syncSubjects() {
		this.isSyncingSubjects = true;

		this.classesService.syncSubjects().pipe(takeUntil(this.destroy$), finalize(() => this.isSyncingSubjects = false)).subscribe({
			next: (resp) => this.responseHandler.success(resp, "syncSubjects()"),
			error: (err) => this.responseHandler.error(err, "syncSubjects()"),
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
