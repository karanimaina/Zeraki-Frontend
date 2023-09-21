import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-partner-list",
	templateUrl: "./partner-list.component.html",
	styleUrls: ["./partner-list.component.scss"]
})
export class PartnerListComponent implements OnInit, OnDestroy {
	schools: any;
	partners: any;
	partners_edi_in_progress = false;
	partners_requests: any;
	dataoptions: any = {
		add_partners: false,
		show_partner_requests: false,
		show_account: false
	};
	create_partners_options: any = {};
	teacher_radio = true;
	external_radio = false;
	destroy$: Subject<boolean> = new Subject<boolean>();

	constructor(
		private dataService: DataService,
		private litemoreService: LitemoreService,
		private toast: HotToastService,
		private responseHandlerService: ResponseHandlerService,
		private translate: TranslateService
	) {}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.create_partners_options.new_external_partner = {
			name: "",
			phone: "",
			region: "",
			info: ""
		};
		this.showPartners();
		this.getSchools();
	}

	togglePartner(radio: string) {
		if (radio === "teacher") {
			this.teacher_radio = true;
			this.external_radio = false;
		} else if (radio === "external") {
			this.teacher_radio = false;
			this.external_radio = true;
		}
	}

	getSchools() {
		this.litemoreService
			.getAccountManagerSchools()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					this.schools = resp.reset_code_schools;
					console.warn(resp);
				},
				error: (err) => {
					this.responseHandlerService.error(err, "getSchools()");
				}
			});
	}

	showPartners() {
		this.dataService
			.get("groups/zerakipartners")
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp) => {
					this.dataoptions.add_partners = false;
					this.partners = resp;
					this.partners_edi_in_progress = false;
				},
				error: (err) => {
					this.responseHandlerService.error(err, "showPartners()");
				}
			});
	}

	showPartnerRequests() {
		this.dataService
			.get("groups/zerakipartners/request")
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp) => {
					this.partners_requests = resp;
				},
				error: (err) => {
					this.responseHandlerService.error(err, "showPartnerRequests()");
				}
			});
	}

	initEditPartner(p: any) {
		p.name_temp = p.name;
		p.region_temp = p.region;
		p.phone_temp = p.phone;
		p.info_temp = p.info;
		p.edit = true;
		this.partners_edi_in_progress = true;
	}

	searchProspectiveTeacherPartner() {
		if (this.create_partners_options.school) {
			const params =
				"?name=" +
				this.create_partners_options.teacher_name +
				"&schoolid=" +
				this.create_partners_options.school.schoolid;
			this.dataService
				.get("groups/searchprospectiveteacherpartner" + params)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						this.create_partners_options.prospective_partners = resp;
						if (resp.length == 0) {
							this.toast.info("No teachers found");
						}
					},
					error: (err) => {
						this.responseHandlerService.error(
							err,
							"searchProspectiveTeacherPartner()"
						);
					}
				});
		}
	}

	cancelEditPartner(p: any) {
		p.edit = false;
		let edit_in_progress = false;
		this.partners.forEach((partner) => {
			if (partner.edit) {
				edit_in_progress = true;
			}
		});
		this.partners_edi_in_progress = edit_in_progress;
	}

	makePartner(teacher: any, isRequest?: any) {
		const text = this.translate.instant(
			"litemore.managers.partners.partnerList.makePartnerSwal.text",
			{ teacher: teacher.name }
		);
		Swal.fire({
			title: this.translate.instant(
				"litemore.managers.partners.partnerList.makePartnerSwal.title"
			),
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.managers.partners.partnerList.makePartnerSwal.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.managers.partners.partnerList.makePartnerSwal.no"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				this.dataService
					.post(teacher, "groups/zerakipartners/add")
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (resp: any) => {
							teacher.isPartner = true;
							this.responseHandlerService.success(resp, "makePartner()");
							if (isRequest == true) {
								this.showPartnerRequests();
							}
						},
						error: (err) => {
							this.responseHandlerService.error(err, "makePartner()");
						}
					});
			}
		});
	}

	addExternalPartner(
		externalPartner: any,
		externalPartnerAdditionForm: NgForm
	) {
		const title = this.translate.instant(
			"litemore.managers.partners.partnerList.addPartner.title"
		);
		const text = this.translate.instant(
			"litemore.managers.partners.partnerList.addPartner.text",
			{ teacher: externalPartner.name }
		);
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.managers.partners.partnerList.addPartner.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.managers.partners.partnerList.addPartner.no"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				this.dataService
					.post(externalPartner, "groups/zerakipartners/add/external")
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (resp: any) => {
							this.create_partners_options.new_external_partner = {};
							this.responseHandlerService.success(resp, "addExternalPartner()");
							externalPartnerAdditionForm.resetForm();
						},
						error: (err) => {
							this.responseHandlerService.error(err, "addExternalPartner()");
						}
					});
			}
		});
	}

	removePartner(teacher: any) {
		const title = this.translate.instant(
			"litemore.managers.partners.partnerList.removePartner.title"
		);
		const text = this.translate.instant(
			"litemore.managers.partners.partnerList.removePartner.text",
			{ teacher: teacher.name }
		);
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.managers.partners.partnerList.removePartner.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.managers.partners.partnerList.removePartner.no"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				const params = "?partnerid=" + teacher.partnerid;
				this.dataService
					.deleteObject("groups/zerakipartners" + params)
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (resp: any) => {
							this.responseHandlerService.success(resp, "removePartner()");
							this.removePartnerFromList(teacher.partnerid);
							this.resetPropsectiveTeacherPartnersSearchResults();
						},
						error: (err) => {
							this.responseHandlerService.error(err, "removePartner()");
						}
					});
			}
		});
	}

	private removePartnerFromList(partnerId: number) {
		this.partners = (this.partners as any[]).filter(
			(partner) => partner.partnerid !== partnerId
		);
	}

	private resetPropsectiveTeacherPartnersSearchResults() {
		this.create_partners_options.prospective_partners = [];
	}

	updatePartnerDetails(p: any) {
		this.dataService
			.post(p, "groups/zerakipartners/update")
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					p.name = p.name_temp;
					p.region = p.region_temp;
					p.phone = p.phone_temp;
					p.info = p.info_temp;
					this.cancelEditPartner(p);
					this.responseHandlerService.success(resp, "updatePartnerDetails()");
				},
				error: (err) => {
					this.responseHandlerService.error(err, "updatePartnerDetails()");
				}
			});
	}

	trackByFn(index, partner) {
		return partner.partnerid;
	}
}
