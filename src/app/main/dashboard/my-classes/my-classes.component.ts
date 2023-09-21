import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { DashboardService } from "src/app/@core/services/dashboard/dashboard.service";

@Component({
	selector: "app-my-classes",
	templateUrl: "./my-classes.component.html",
	styleUrls: ["./my-classes.component.scss"]
})
export class MyClassesComponent implements OnInit, OnDestroy {
	myClasses$?: Observable<any[]>;
	myClasses: any;
	classesSubscription?: Subscription;
	isLoading = false;
  
	constructor(private dashboardService: DashboardService, private router: Router) { }

	ngOnInit(): void {
		// this.myClasses$ = this.dashboardService.getRolesInfo();
		this.isLoading = true;
		this.classesSubscription = this.dashboardService.getRolesInfo().subscribe(val => {
			// console.warn("myClasses >> ", val);
			this.myClasses = val;
			this.isLoading = false;
		});
	}

	// Multi value observables must manually unsubscribe to prevent memory leaks.
	ngOnDestroy() {
		this.classesSubscription?.unsubscribe();
	}

	analyzeSubjectClass(data: any) {
		if (data.seriesid !== undefined && data.seriesid !== null && data.seriesid > 0) {
			console.warn("Here 1");
			this.router.navigate(["/main/exams/manage/analysis/subject", data.seriesid, -1,-1, -1, data.cid, -1]);
		} else if (data.egroupid !== undefined && data.egroupid !== null && data.egroupid > 0) {
			console.warn("Here 2");
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
