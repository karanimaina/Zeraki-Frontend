import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-new-track",
	templateUrl: "./new-track.component.html",
	styleUrls: ["./new-track.component.scss"]
})
export class NewTrackComponent implements OnInit {
	page = 0;
	data: any = {};
	@Output() balanceSms = new EventEmitter<any>();
	@Output() updateLoadingTrackUsage = new EventEmitter<any>();

	constructor(private dataService: DataService) { }

	ngOnInit(): void {
		this.getMessages(0);
	}

	firstPage() {
		this.page = 0;
		this.getMessages(this.page);
	}

	previousPage() {
		this.page = this.page - 1;
		this.getMessages(this.page);
	}

	nextPage() {
		this.page = this.page + 1;
		this.getMessages(this.page);
	}

	getMessages(page: any) {
		let url = "groups/message_groups/" + page;
		if (page > 0 && this.data) {
			url += "?total=" + this.data.total;
		}
		this.dataService.get(url).subscribe({
			next: resp => {
				this.data = resp;
				this.balanceSms.emit(this.data?.credits);
				this.updateLoadingTrackUsage.emit(false);
				this.page = this.data?.page;
			},
			error: error => {
				console.error("ERROR >>", error);
				this.updateLoadingTrackUsage.emit(false);
			}
		});
	}

}
