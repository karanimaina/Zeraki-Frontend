import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { BehaviourService } from "src/app/@core/services/behaviour/behaviour.service";

@Component({
	selector: "app-residence-student-behaviour",
	templateUrl: "./residence-student-behaviour.component.html",
	styleUrls: ["./residence-student-behaviour.component.scss",
		"../class-behaviour/class-behaviour.component.scss"]
})
export class ResidenceStudentBehaviourComponent implements OnInit {

	pathParams: any;
	timeLine: any;
	classStatistics: any;
	classRecent: any;
	classStudentPoints: any;
	classStudentAwards: any;
	a: number[] = [1, 2, 3, 4];

	selectedYear: any;
	selectedYearLabel: any;
	selectedTerm: any;
	selectedType: any = 4;
	selectedResidence:any;
	selectedTerms: any[] = [];

	displayRecentRecords = true;
	displayStudentPoints = false;
	displayAwards = false;
	noDataFound = false;
	count = 0;


	constructor(
    private bService:BehaviourService,
    private route:ActivatedRoute,
    private toastService:HotToastService,
    private translate:TranslateService,
	) { }

	ngOnInit(): void {
		this.route.params.subscribe((params:any)=>{
			this.pathParams = params;
			this.selectedYear = params.ayid,
			this.selectedTerm = params.term;
			this.selectedResidence = params.residenceid;
			this.loadBehaviourTimeLine("?type=2");
		});
	}


	loadBehaviourTimeLine(param: any) {
		this.bService.getBehaviourTimeline(param).subscribe(
			(res) => {
				if (res.toString().length > 4) {
					this.noDataFound = false;
					this.timeLine = res;
					// this.selectedYear = res.most_recent_ayid;
					// this.selectedTerm = res.most_recent_term;

					this.academicYearChange();
					//load class recent
					this.loadClassRecent(0);
					//load clasStudentPoints
					this.loadClassStudentPoints(0);
					//loadClassStudentAwards
					this.loadAwards(0);
				} else {
					this.noDataFound = true;
					console.log("Welcome");
				}
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	loadClassRecent(page: any) {
		this.bService.getClassRecent(this.selectedYear, this.selectedTerm, this.selectedType, page,null,null,this.pathParams.residenceid).subscribe(
			(res) => {
				this.classRecent = res;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}
	loadClassStudentPoints(page: any) {
		this.bService.getClassStudentPoints(this.selectedYear, this.selectedTerm, this.selectedType, page,null,null,this.pathParams.residenceid).subscribe(
			(res) => {
				this.classStudentPoints = res;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}
	loadAwards(page: any) {
		this.bService.getClassStudentAwards(this.selectedYear, this.selectedTerm, this.selectedType, page,null, null,this.pathParams.residenceid).subscribe(
			(res) => {
				this.classStudentAwards = res;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	academicYearChange() {
		this.timeLine.academic_years.forEach((ayear: any) => {
			if (ayear.ayid == this.selectedYear) {
				this.selectedYearLabel = ayear.name;
				this.selectedTerms = ayear.terms;
				if (this.count == 0) {
					this.selectedTerm = this.timeLine.most_recent_term;
				} else {
					this.selectedTerm = this.selectedTerms[0];
					//load class recent
					this.loadClassRecent(0);
					//load clasStudentPoints
					this.loadClassStudentPoints(0);
					//loadClassStudentAwards
					this.loadAwards(0);
				}
				this.count++;
			}
		});
	}

	termChange() {
		//load class recent
		this.loadClassRecent(0);
		//load clasStudentPoints
		this.loadClassStudentPoints(0);
		//loadClassStudentAwards
		this.loadAwards(0);
	}

	showRecentRecord(): void {
		this.displayRecentRecords = true;
		this.displayStudentPoints = false;
		this.displayAwards = false;
	}

	showStudentPoints(): void {
		this.displayRecentRecords = false;
		this.displayStudentPoints = true;
		this.displayAwards = false;
	}

	showAwards(): void {
		this.displayRecentRecords = false;
		this.displayStudentPoints = false;
		this.displayAwards = true;
	}

	deleteBehaviourRecord(s: any) {

	}

}