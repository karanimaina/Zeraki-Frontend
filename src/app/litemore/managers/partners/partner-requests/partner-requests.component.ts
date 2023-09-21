import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";
import {TranslateService} from "@ngx-translate/core";

@Component({
	selector: "app-partner-requests",
	templateUrl: "./partner-requests.component.html",
	styleUrls: ["./partner-requests.component.scss"]
})
export class PartnerRequestsComponent implements OnInit, OnDestroy {
	isLoadingParterRequests = false;
	partners_edi_in_progress = false;
	partners_requests: any[] = [];
	dataSource: MatTableDataSource<any> = new MatTableDataSource();
	destroy$: Subject<boolean> = new Subject<boolean>();

	constructor(
    private litemoreService: LitemoreService,
    private dataService: DataService,
    private responseHandlerService: ResponseHandlerService,
	private translate:TranslateService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getZerakiPartners_Requests();
	}

	getZerakiPartners_Requests() {
		this.isLoadingParterRequests = true;

		this.litemoreService.getZerakiPartners_Requests().pipe(takeUntil(this.destroy$)).subscribe({
			next: resp => {
				this.partners_requests = resp;
				this.dataSource = new MatTableDataSource(this.partners_requests);
			},
			error: err => {
				this.responseHandlerService.error(err, "getZerakiPartners_Requests()");
			},
			complete: () => this.isLoadingParterRequests = false,
		});
	}

	makePartner(teacher: any, isRequest: boolean) {
		const title = this.translate.instant('litemore.managers.partners.partnerRequest.makePartnerSwal.title');
		const text = this.translate.instant('litemore.managers.partners.partnerRequest.makePartnerSwal.text',{teacher:teacher.name})
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant('litemore.managers.partners.partnerRequest.makePartnerSwal.yes'),
			cancelButtonText: this.translate.instant('litemore.managers.partners.partnerRequest.makePartnerSwal.no')
		}).then((result) => {
			if (result.isConfirmed) {
				this.dataService.post(teacher, "groups/zerakipartners/add").pipe(takeUntil(this.destroy$)).subscribe({
					next: (resp: any) => {
						teacher.isPartner = true;
						this.responseHandlerService.success(resp, "makePartner()");
						if (isRequest) {
							this.getZerakiPartners_Requests();
						}
					},
					error: err => {
						this.responseHandlerService.error(err, "makePartner()");
					}
				});
			}
		});
	}

	rejectPartner(teacher: any) {
		const title = this.translate.instant('litemore.managers.partners.partnerRequest.rejectPartnerRequest.title');
		const text = this.translate.instant('litemore.managers.partners.partnerRequest.rejectPartnerRequest.text', {teacher:teacher.name});
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant('litemore.managers.partners.partnerRequest.makePartnerSwal.yes'),
			cancelButtonText: this.translate.instant('litemore.managers.partners.partnerRequest.makePartnerSwal.no')
		}).then(result => {
			if (result.isConfirmed) {
				const params = "?partnerid=" + teacher.partnerid;
				this.dataService.deleteObject("groups/zerakipartners/request/reject" + params).pipe(takeUntil(this.destroy$)).subscribe({
					next: (resp: any) => {
						this.responseHandlerService.success(resp, "rejectPartner()");
						this.getZerakiPartners_Requests();
					},
					error: err => {
						this.responseHandlerService.error(err, "rejectPartner()");
					}
				});
			}
		});
	}

	trackByFn(index, partner) {
		return partner.partnerid;
	}

}
