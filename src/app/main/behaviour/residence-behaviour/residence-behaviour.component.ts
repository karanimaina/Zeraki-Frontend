import { Component, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { BehaviourService } from "src/app/@core/services/behaviour/behaviour.service";

@Component({
	selector: "app-residence-behaviour",
	templateUrl: "./residence-behaviour.component.html",
	styleUrls: ["./residence-behaviour.component.scss"]
})
export class ResidenceBehaviourComponent implements OnInit {

	timeLine: any;
	residenceBehaviour: any;
	selectedYear: any;
	selectedYearLabel: any;
	selectedTerm: any;
	selectedType: any = 3;
	selectedTerms: any[] = [];
	count = 0;

	constructor(
    private bService: BehaviourService,
    private toastService: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.loadTimeline();
	}

	loadTimeline() {
		this.bService.getBehaviourTimeline("?type=" + (this.selectedType - 1)).subscribe(
			(res) => {
				this.timeLine = res;
				this.selectedYear = res.most_recent_ayid;
				this.selectedTerm = res.most_recent_term;
				this.academicYearChange();
				this.loadStatistics();
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
				console.log(err);
			}
		);
	}

	loadStatistics() {
		this.bService.getClassStatistics(this.selectedYear, this.selectedTerm, this.selectedType, null, null).subscribe(
			(res) => {
				this.residenceBehaviour = res;
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
					this.loadStatistics();

				}
				this.count++;
			}
		});
	}


	termChange() {
		this.loadStatistics();
	}


}
