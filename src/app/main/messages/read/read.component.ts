import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { Location } from "@angular/common";
import { take } from "rxjs/operators";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";

@Component({
	selector: "app-read",
	templateUrl: "./read.component.html",
	styleUrls: ["./read.component.scss"]
})
export class ReadComponent implements OnInit {

	allMessages: any;
	messageId: any;
	current_message: any;

	constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessagingService,
    public location: Location
	) {
		this.activatedRoute.params.subscribe(params => {
			// this.param = params['yourParam'];
			this.ngOnInit(); // reset and set based on new parameter this time
		});
	}

	ngOnInit(): void {
		this.messageId = this.activatedRoute.snapshot.paramMap.get("id");
		this.getMessages(0);
	}

	getMessages(page: any) {
		const url = "groups/messages/" + page;
		this.dataService.get(url).subscribe((resp: any) => {
			//  console.warn("Resp read >> ",resp);
			this.allMessages = resp.messages;
			if (this.allMessages.length > 0) {
				this.current_message = this.allMessages.find( ({ messageid }) => messageid == this.messageId );
				//  console.warn('this.current_message >> ', this.current_message);
				if (!this.current_message?.messageRead) {
					this.markAsRead(this.current_message);
				}
			}
		});
	}

	markAsRead(message: any) {
		this.messageService.markAsRead(message?.messageid).subscribe({
			next: resp => {
				console.warn("markAsRead >>", resp);
			},
			error: err => {
				console.error("markAsRead >>", err);
			},
			complete: () => {
				console.warn("markAsRead complete");
				this.updateNotifications(message.messageid);
			}
		});
	}

	updateNotifications(messageid: number) {
		console.warn("updateNotifications");
		this.dataService.notificationsData.pipe(take(1)).subscribe(resp => {
			const index = resp.messagesToDisplay.findIndex((msg: any) => msg.messageId === messageid);

			if (index > -1) {
				console.warn("updated Notifications");
				const newNotfsObj = {
					messagesToDisplay: resp.messagesToDisplay.splice(index, 1),
					notificationCount: resp.notificationCount - 1,
					notificationTitle: `You have ${resp.notificationCount - 1} unread messages`,
					showNotification: (resp.notificationCount - 1) > 0? true: false
				};
				console.warn("updated Notifications >>", newNotfsObj);
				this.dataService.notificationsData.next(newNotfsObj);
			}
		});
	}

}
