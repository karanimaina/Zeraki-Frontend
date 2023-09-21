import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Subscription } from "rxjs";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-subject-comments",
	templateUrl: "./subject-comments.component.html",
	styleUrls: ["./subject-comments.component.scss"]
})
export class SubjectCommentsComponent implements OnInit, OnDestroy {
	classesSubscription?: Subscription;
	detailsSubscription?: Subscription;
	routeId: any;
	subject_comments: any;
	basicDetailsObj: any;
	formOrYearObj: any;
	error_msg: any;
	editAll = false;

	constructor(
    private classesService: ClassesService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    public _location: Location) { }

	ngOnDestroy(): void {
		this.classesSubscription?.unsubscribe();
		this.detailsSubscription?.unsubscribe();
	}

	ngOnInit(): void {
		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");
		// console.warn("Snapshot2 >> ", this.routeId);
		this.dataService.schoolData.subscribe(val => {
			// console.warn("getSchoolTypeData >> ", val);
			this.formOrYearObj = val;
		});
		if (this.routeId) {
			this.getStreamBasicDetails(this.routeId);
			this.getSubjectComments(this.routeId);
		} else {
			console.error("No Id found for form");
		}
	}

	getSubjectComments(routeId: any){
		this.classesSubscription = this.classesService.getSubjectComments(routeId).subscribe(val => {
			// console.warn("getSubjectComments >> ", val);
			this.subject_comments = val;
			this.initEditAll();
		});
	}

	getStreamBasicDetails(routeId: any){
		this.classesService.getStreamBasicDetails(routeId).subscribe(val => {
			// console.warn("getStreamBasicDetails >> ", val);
			this.basicDetailsObj = val;
		});
	}

	initEditAll(edit = false){
		this.subject_comments?.students.forEach((student: any) => {
			if (edit) {
				if (!student.edit) {
					student.comment_temp = {};
					student.comment_temp.text = "";
					if (student.comment != undefined && student.comment != null && student.comment.text != undefined) {
						student.comment_temp = student.comment;
					}
					student.edit = true;
				}
			} else {
				student.edit = false;
			}
		});
		this.editAll = edit;
	}

	saveComments() {
		const updated_comments: any[] = [];
		this.subject_comments?.students.forEach((student: any) => {
			if (student.comment_temp != undefined && student.comment_temp != null) {
				student.comment_temp.userid = student.userid;
				updated_comments.push(student.comment_temp);
			}
		});

		if (updated_comments.length > 0) {
			const url = `groups/student/subject/comments/${this.routeId}`;
			this.dataService.send(JSON.stringify(updated_comments), url)
				.subscribe({
					next: data => {
						// console.warn("DATA >> ", data);
						this.initEditAll();
						this.getSubjectComments(this.routeId);
					},
					error: error => {
						// this.errorMessage = error.message;
						console.error("send() error!", error);
						error.message? this.error_msg = error.message: this.error_msg = "Server Error";
					}
				});
		}
	}

}
