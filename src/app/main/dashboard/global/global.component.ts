import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DashboardService } from "src/app/@core/services/dashboard/dashboard.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-global",
	templateUrl: "./global.component.html",
	styleUrls: ["./global.component.scss"],
})

export class GlobalComponent implements OnInit {
	dashSummary: any;
	recents$?: Observable<any[]>;
	dialog: any;

	schoolTypeData$: Observable<SchoolTypeData> = this.dataService.schoolData;

	constructor(
		private dashboardService: DashboardService,
		private router: Router,
		private dataService: DataService,
	) { }

	ngOnInit(): void {
		this.recents$ = this.dashboardService.getRecentExam();
		// this.dashboardService.getRecentExam().subscribe(val => {
		//   // console.warn("dashSummary >> ", val);
		//   this.recents = val;
		// });
	}


	formatNumber(formatNumber:any):any {
		return (Math.round(formatNumber * 100) / 100).toFixed(3);
	}

	goToExam(form: any) {
		if (form.no_exams_msg == undefined) {
			this.router.navigate(["/main/exams/manage/analysis", form.intakeid]);
		}
	}

}
