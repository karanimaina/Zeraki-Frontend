import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-old-track",
	templateUrl: "./old-track.component.html",
	styleUrls: ["./old-track.component.scss"]
})
export class OldTrackComponent implements OnInit {
	page = 0;
	data: any = {};
	@Output() balanceSms = new EventEmitter<any>();

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
		let url = "groups/old/message_groups/" + page;
		if (page > 0 && this.data) {
			url += "?total=" + this.data.total;
		}
		this.dataService.get(url).subscribe({
			next: resp => {
				// console.warn("getMessages() DATA >> ", resp);
				this.data = resp;
				this.balanceSms.emit(this.data?.credits);
				this.page = this.data?.page;
			},
			error: error => {
				console.error("ERROR >>", error);
			}
		});
	}

}
