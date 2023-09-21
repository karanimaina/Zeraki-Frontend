import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { TeacherService } from "src/app/@core/services/teacher/teacher.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import {SchoolTypeData} from "../../../@core/models/school-type-data";

@Component({
	selector: "app-teacher-classes",
	templateUrl: "./teacher-classes.component.html",
	styleUrls: ["./teacher-classes.component.scss"]
})
export class TeacherClassesComponent implements OnInit {

	teacher: any;
	image_path = this.dataService.getUserImage();
	schoolData!: SchoolTypeData;
	isLoading = false;

	constructor(
    private teacherService: TeacherService,
    private dataService: DataService,
    private activateRoute: ActivatedRoute,
    private router: Router) { }


	ngOnInit(): void {
		this.activateRoute.params.subscribe(param => {
			if (param.userid) {
				this.isLoading = true;
				forkJoin([
					this.teacherService.getUserRoles_Info_Teacher(param.userid).pipe(catchError(e => of(e))),
				]).subscribe(([teacher]) => {

					// console.warn("getUserRoles_Info_Teacher >> ", teacher);
					this.teacher = teacher;
					this.controller();
					this.isLoading = false;
				},(err)=>{
					this.isLoading = false;
				});
			}
		});
		this.dataService.schoolData.subscribe((resp) => {
			this.schoolData = resp;
		});
	}

	controller() {
		if (this.teacher.url !== null && this.teacher.url.length > 0) {
			this.image_path = this.dataService.getUserImage(this.teacher.url);
		}
	}

	analyzeSubjectClass(data: any) {
		if (data.seriesid !== undefined && data.seriesid !== null && data.seriesid > 0) {
			// manage/analysis/subject/:seriesid/:egroupid/:subjectid/:intakeid/:classid
			this.router.navigate(["/main/exams/manage/analysis/subject", data.seriesid, -1,-1, -1, data.cid, -1]);
		} else if (data.egroupid !== undefined && data.egroupid !== null && data.egroupid > 0) {
			this.router.navigate(["/main/exams/manage/analysis/subject", -1, data.egroupid,-1, -1, data.cid, -1]);
		}
	}

	goToFormAnalysis(classData: any) {
		if (classData.aggregate_stats != null) {
			this.router.navigate(["/main/exams/manage/analysis", classData.intakeid]);
		}
	}

	goToStreamAnalysis(classData: any) {
		if (classData.aggregate_stats != null) {
			this.router.navigate(["/main/exams/manage/analysis", -1, classData.streamid, -1, -1]);
		}
	}

}
