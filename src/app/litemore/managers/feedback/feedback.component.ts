import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";

@Component({
	selector: "app-feedback",
	templateUrl: "./feedback.component.html",
	styleUrls: ["./feedback.component.scss"]
})
export class FeedbackComponent implements OnInit, OnDestroy {
	feedbackListSub!: Subscription;
	feedBackListLoading = false;
	feedbackList: any;
	dataSource: MatTableDataSource<any> = new MatTableDataSource();

	constructor(
		private litemoreService: LitemoreService,
    private toast: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.retrieveFeedbackList();
	}

	ngOnDestroy(): void {
		this.feedbackListSub?.unsubscribe();
	}

	retrieveFeedbackList() {
		this.feedBackListLoading = true;

		this.feedbackListSub = this.litemoreService.getFeedback().subscribe({
			next: resp => {
				// console.log(resp);

				this.feedbackList = resp;
				this.dataSource = new MatTableDataSource(this.feedbackList);
				this.feedBackListLoading = false;
			},
			error: err => {
				console.error(err);

				this.feedBackListLoading = false;
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});
	}

}
