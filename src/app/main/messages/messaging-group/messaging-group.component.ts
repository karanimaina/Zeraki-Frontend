import {Location} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {DataService} from "src/app/@core/shared/services/data/data.service";
import {ResponseHandlerService} from "src/app/@core/shared/services/response-handler/response-handler.service";
import {RolesService} from "src/app/@core/shared/services/role/roles.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-messaging-group",
	templateUrl: "./messaging-group.component.html",
	styleUrls: ["./messaging-group.component.scss"]
})
export class MessagingGroupComponent implements OnInit {
	// eslint-disable-next-line camelcase
	is_first_load = false;
	action = 1;
	// eslint-disable-next-line camelcase
	show_sms_delivery_summary_table = false;
	page = 0;
	groupid: any;
	isLoadingMessageGroupInfo = true;
	loadCount = 0;
	data: any = {};

	get isNormalTeacher() {
		return this.rolesService.isNormalTeacher;
	}

	constructor(
		public _location: Location,
		private dataService: DataService,
		private translate: TranslateService,
		private rolesService: RolesService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private responseHandler: ResponseHandlerService
	) {
	}

	ngOnInit(): void {
		this.groupid = this.activatedRoute.snapshot.paramMap.get("id");
		// console.warn("Snapshot2 >> ", this.groupid);
		if (this.page > 0) {
			this.getMessages(this.page);
		} else {
			this.getMessages(0);
			this.is_first_load = true;
		}
	}

	toggleAction(action: any) {
		this.action = action;
	}

	firstPage() {
		this.action = 1;
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

	goToStudentProfile(message: any) {
		if (!this.isNormalTeacher) {
			if (message && message?.admno && message?.to) {
				this.router.navigateByUrl(`/main/students/prof/${message.to.userid}`);
			}
		}
	}

	confirmResendMessages(): Promise<any> {
		return Swal.fire({
			title: this.translate.instant("messages.group.swal.titleAllMessages"),
			text: this.translate.instant("messages.group.swal.textAllMessages"),
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes")
		});
	}

	async resendAllMessages() {
		try {
			const response = await this.confirmResendMessages();
			if (response.isConfirmed) this.initResendAllMessages();

		} catch (e) {
			// no opp
		}
	}

	initResendAllMessages() {
		const url = "groups/school/message-group/resend?groupId=" + this.groupid;

		this.dataService.send(null, url)
			.subscribe(
				(data: any) =>	this.responseHandler.success(data, "resendMessage()"),
				error => this.responseHandler.error(error, "resendMessage()"),
				() => this.getMessages(this.page)
			);
	}

	resendMessage(message: any) {
		if (message != null && message.messageid != null && message.to != null) {
			Swal.fire({
				title: this.translate.instant("messages.group.swal.title"),
				text: this.translate.instant("messages.group.swal.text", {name: message.to.name}),
				icon: "question",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes")
			}).then((result) => {
				if (result.isConfirmed) {
					const url = "groups/school/message/resend?messageid=" + message.messageid;

					this.dataService.send(null, url)
						.subscribe({
							next: (data: any) => {
								this.responseHandler.success(data, "resendMessage()");
							},
							error: error => {
								this.responseHandler.error(error, "resendMessage()");
							},
							complete: () => {
								this.getMessages(this.page);
							}
						});
				}
			});
		}
	}


	// updatePath(page: any) {
	//   // this.router.navigate(['../team', 33, 'user', 11], {relativeTo: this.activatedRoute});
	//   if (this.is_first_load && page == 0) {
	//     this.router.navigate(['../', this.page], {relativeTo: this.activatedRoute});
	//   } else {
	//       //$state.go("home.admin.message.messagegroup", {groupid: $stateParams.groupid, page: page}, {notify: false, reload: false, inherit: true});
	//       this.router.navigate([this.page], {relativeTo: this.activatedRoute});
	//   }
	//   this.is_first_load = false;
	// }

	getMessages(page: any) {
		let url = "groups/sms/" + page + "?groupid=" + this.groupid;
		if (page > 0 && !(this.page > 0)) {
			url += "&total=" + this.data.total;
		}
		this.isLoadingMessageGroupInfo = true;
		this.dataService.get(url).subscribe({
			next: (resp: any) => {
				if (resp != null && resp.messages != null && resp.messages.length > 0) {
					resp.messages.forEach((msg: any) => {
						msg.visible = false;
					});
				}

				this.data = resp;
				this.page = this.data.page;
				if (this.data != null && this.data.message_group != null) {
					this.show_sms_delivery_summary_table = (this.data.message_group.sms_status == 1 || this.data.message_group.is_archived) && this.data.message_group.recipients >= 0;
				}
			},
			error: error => {
				console.error("ERROR getMessages() >>", error);
				this.isLoadingMessageGroupInfo = false;
				if (this.is_first_load) this.is_first_load= false;
			},
			complete: () => {
				this.isLoadingMessageGroupInfo = false;
				if (this.is_first_load) this.is_first_load= false;
				// this.updatePath(this.page);
			}
		});
	}

}
