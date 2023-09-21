import { Component, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { BehaviourService } from "src/app/@core/services/behaviour/behaviour.service";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { RolesService } from "../../../@core/shared/services/role/roles.service";

@Component({
	selector: "app-infractions-approval",
	templateUrl: "./infractions-approval.component.html",
	styleUrls: ["./infractions-approval.component.scss"]
})
export class InfractionsApprovalComponent implements OnInit {

	allPending = true;

	pendingApprovals: any;
	myClassesApprovals: any;

	classApprovalType: any = 1;
	pendingApprovalType: any = 2;

	school_profile: any = {};
	user_roles: any = {};

	constructor(
    private bService: BehaviourService,
    private examService: ExamService,
	private dataService: DataService,
    private rolesService: RolesService,
    private toastService: HotToastService,
    private translate: TranslateService,
	) { }


	ngOnInit(): void {
		this.loadUserRoles();


	}

	loadSchoolProfile() {
		this.dataService.schoolData.subscribe(
			(res) => {
				this.school_profile = res;
			}
		);
	}

	loadUserRoles() {
		this.rolesService.getUserRoles().subscribe(
			(res) => {
				this.user_roles = res;
				this.loadClassApproval(0);
				if (res.isSchoolAdmin) {
					this.loadPendingApproval(0);
				}
			}
		);
	}

	loadClassApproval(page: any) {
		this.bService.getAllApprovals(this.classApprovalType, page).subscribe((res) => {
			this.myClassesApprovals = res;
		}, (err) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	loadPendingApproval(page: any) {
		this.bService.getAllApprovals(this.pendingApprovalType, page).subscribe((res) => {
			this.pendingApprovals = res;
		}, (err) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}


	toggleView() {
		this.allPending = !this.allPending;
	}

	actOnApproval(approvalid: any, type: any) {

		if (approvalid != null && type != null && (type == 1 || type == 2)) {
			let title = "";
			let msg = "";
			if (type == 1) {
				title = this.translate.instant("behaviour.infractionsApproval.swal.titleApprove");
				msg = this.translate.instant("behaviour.infractionsApproval.swal.textApprove");
			} else if (type == 2) {
				title = this.translate.instant("behaviour.infractionsApproval.swal.titleReject");
				msg = this.translate.instant("behaviour.infractionsApproval.swal.textReject");
			}

			Swal.fire({
				title: title,
				text: msg,
				icon: "question",
				showCancelButton: true
			}).then((isConfirm) => {
				if (isConfirm.isConfirmed) {
					const params = "?approvalid=" + approvalid + "&type=" + type;
					const url = "/groups/behaviour/infractionapprovals";
					this.examService.doPostNoParams(url + params).subscribe(
						(res) => {
							console.log(res.message);

							const message = this.translate.instant("behaviour.infractionsApproval.toastMessages.saveSuccess");
							this.toastService.success(message);

							this.loadClassApproval(this.myClassesApprovals.page);
							if (res.isSchoolAdmin) {
								this.loadPendingApproval(this.pendingApprovals.page);
							}
						}, (err) => {
							console.log(err.error.message);

							const message = this.translate.instant("common.toastMessages.anErrorOccurred");
							this.toastService.error(message);
						}
					);
				}
			});
		}
	}
}
