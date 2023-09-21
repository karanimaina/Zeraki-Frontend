import { Component, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "src/app/@core/models/Role";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { SettingsService } from "src/app/@core/services/settings/settings.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-user-roles",
	templateUrl: "./user-roles.component.html",
	styleUrls: ["./user-roles.component.scss"]
})
export class UserRolesComponent implements OnInit {
	messengers: any;
	selected_members: any = {};
	toggleAssignmentView: any = {};
	getting_data = false;
	members: any;
	useridsOfCurrentMessengers: any;
	error_msg = "";

	showRoles = false;
	assignRole = false;
	teachers: any;
	staff: any;
	teachers_radio = true;
	staff_radio = false;
	userRoles!:Role;
	constructor(
		private dataService: DataService,
		private settingsService: SettingsService,
		private messagingService: MessagingService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private rolesService: RolesService) {
		this.rolesService.roleSubject.subscribe((role: Role) => {
			this.userRoles = role;
		});
		this.checkSchoolAuthenticatedStatus();
		this.getMessengers();
	}

	ngOnInit(): void {
		this.selected_members.list = [];
		this.selected_members.t = true;
		this.selected_members.o = false;
		// this.setSelectedMemberCategory(0);
	}

	checkSchoolAuthenticatedStatus() {
		this.dataService.getUserInitialization().subscribe(resp => {
			// console.warn("getUserInitialization() >> ", resp);
			const user_init: any = resp;
			if (!user_init.school_validity_info?.is_valid_school) {
				// this.router.navigateByUrl("home");
			}
			return user_init;
		});
	}

	getTeachers() {
		this.getting_data = true;
		this.messagingService.getTeachers().subscribe({
			next: resp => {
				console.warn("getTeachers() >> ", resp);
				this.teachers = resp;
				this.teachers = this.teachers.filter((el: any) => !this.selected_members.list.includes(el.userid));
				this.useridsOfCurrentMessengers = this.messengers.map((el: any) => {
					return el.userid;
				});
				this.teachers = this.teachers.filter((el: any) => !this.useridsOfCurrentMessengers.includes(el.userid));
				this.teachers = this.teachers.filter((el: any) => !el.admin);
			},
			error: err => {
				console.error("getTeachers() Error >> ", err);
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
				this.getting_data = false;
			}
		});
	}

	selectedMembers() {
		console.log(this.selected_members.list);
	}

	setSelectedMemberCategory(n: number) {
		if (n == 0) {
			if (this.selected_members.t) {
				this.selected_members.t = true;
				this.selected_members.o = false;
				this.getTeachers();
			} else {
				this.selected_members.t = false;
			}
		} else if (n == 1) {
			if (this.selected_members.o) {
				this.selected_members.o = true;
				this.selected_members.t = false;
				this.getWorkers();
			} else {
				this.selected_members.o = false;
			}
		}
	}

	assignMembersRole() {
		const url = "groups/school/messengers?userids=" + JSON.stringify(this.selected_members.list);
		if (this.selected_members.list.length > 0) {
			this.dataService.send(JSON.stringify({}), url).subscribe({
				next: (resp: any) => {
					// console.warn("RESP >> ", resp);
					console.log(resp.message);

					const message = this.translate.instant("settings.userRoles.toastMessages.assignMembersSuccess");
					this.toastService.success(message);
				},
				error: err => {
					if (err !== undefined && err.message !== undefined) {
						console.log(err.message);

						const message = this.translate.instant("settings.userRoles.toastMessages.assignMembersError");

						this.error_msg = message;
						this.toastService.error(message);
					}
				},
				complete: () => {
					this.settingsService.getMessengers().subscribe({
						next: response => {
							this.messengers = response;
						},
						error: err => {
							console.warn("Err >> ", err);
							const message = this.translate.instant("common.toastMessages.anErrorOccurred");
							this.toastService.error(message);
							this.getting_data = false;
						}
					});
					this.assignRole = false;
					this.toggleAssignmentView.hide = false;
					this.selected_members.list = [];
					this.getWorkers();
					this.getTeachers();
				}
			});
		}
	}

	getWorkers() {
		this.getting_data = true;
		this.messagingService.getWorkers().subscribe({
			next: resp => {
				console.warn("getWorkers() >> ", resp);
				this.staff = resp;
				this.useridsOfCurrentMessengers = this.messengers.map((el: any) => {
					return el.userid;
				});
				this.staff = this.staff.filter((el: any) => !this.useridsOfCurrentMessengers.includes(el.userid));
				this.staff = this.staff.filter((el: any) => !this.selected_members.list.includes(el.userid));
			},
			error: err => {
				console.error("getWorkers() Err >> ", err);
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
				this.getting_data = false;
			}
		});
	}

	revokeUserRole(user: any, index: number) {
		if (user != null) {
			Swal.fire({
				title: this.translate.instant("settings.userRoles.swal.title"),
				text: this.translate.instant("settings.userRoles.swal.text", { name: user.name }),
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			}).then((result) => {
				if (result.isConfirmed) {
					this.dataService.send(JSON.stringify({}), "groups/school/messenger/rm/" + user.userid).subscribe({
						next: (resp: any) => {
							if (resp.responseCode == 200) {
								console.log(resp.message);

								const message = this.translate.instant("settings.userRoles.toastMessages.revokeRoleSuccess");
								this.toastService.success(message);

								this.messengers.splice(index, 1);
							}
						},
						error: err => {
							console.error("Error >> ", err);
							console.log(err.message);

							const message = this.translate.instant("settings.userRoles.toastMessages.revokeRoleError");
							this.toastService.error(message);
						}
					});
				}
			});
		}
	}

	toggleRadio(radio: string) {
		if (radio === "teachers") {
			this.selected_members.list = [];
			this.teachers_radio = true;
			this.staff_radio = false;
		} else {
			this.selected_members.list = [];
			this.teachers_radio = false;
			this.staff_radio = true;
		}
	}

	getMessengers() {
		this.settingsService.getMessengers().subscribe(resp => {
			console.warn("getMessengers() >> ", resp);
			this.messengers = resp;
		});
	}

}
