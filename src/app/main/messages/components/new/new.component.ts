import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-new",
	templateUrl: "./new.component.html",
	styleUrls: ["./new.component.scss"]
})
export class NewComponent implements OnInit {
	page = 0;
	data: any = {};

	constructor(
		private dataService: DataService,
		private router: Router
	) {}

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

	setCurrentMessage(message: any) {
		console.warn("message >> ", message);
		this.router.navigate(["/main/messages/inbox/read", message.messageid]);
	}

	getMessages(page: any) {
		let url = "groups/messages/" + page;
		if (page > 0) {
			url += "?total=" + this.data.total;
		}
		this.dataService.get(url).subscribe(resp => {
			this.data = resp;
			this.page = this.data.page;
		});
	}
}
