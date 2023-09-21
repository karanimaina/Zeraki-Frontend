import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "../../services/data/data.service";

@Component({
	selector: "app-feedback",
	templateUrl: "./feedback.component.html",
	styleUrls: ["./feedback.component.scss"]
})
export class FeedbackComponent implements OnInit {
	feedback: any = {};
	send_feedback_success_status = false;
	error_status = false;
	error_msg = "";

	constructor(
    private dataService: DataService,
    private toastService: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.initItems();
	}

	sendFeedback(fbForm: NgForm) {
		this.dataService.send(JSON.stringify(this.feedback), "groups/feedback").subscribe({
			next: (resp: any) => {
				console.log(resp.message);

				const successMsg = this.translate.instant("shared.feedback.toastMessages.success");

				// this.toastService.success(resp.message);
				this.toastService.success(successMsg);
				this.send_feedback_success_status = true;
				fbForm.reset();
			},
			error: err => {
				// let error_msg = "Server Error";
				let error_msg = this.translate.instant("shared.feedback.sendFeedbackErrors.defaultError");

				if (err !== undefined && err.message !== undefined) {
					error_msg = err.message;
				}

				this.error_status = true;
				this.error_msg = error_msg;
			}

		});
	}

	initItems() {
		this.send_feedback_success_status = false;
		this.error_status = false;
		this.error_msg = "";
	}

}
