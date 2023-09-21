import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { DashboardService } from "src/app/@core/services/dashboard/dashboard.service";

@Component({
	selector: "app-grad-classes",
	templateUrl: "./grad-classes.component.html",
	styleUrls: ["./grad-classes.component.scss"]
})
export class GradClassesComponent implements OnInit {
	grad_recents$?: Observable<any[]>;
  
	constructor(private dashboardService: DashboardService, private router: Router) { }

	ngOnInit(): void {
		this.grad_recents$ = this.dashboardService.getRecentGraduated();
	}

	goToGradAnalysis(form: any) {
		if (!form?.no_exams_msg) {
			this.router.navigate(["/main/exams/manage/analysis", form.intakeid]);
		}
		
	}

}
