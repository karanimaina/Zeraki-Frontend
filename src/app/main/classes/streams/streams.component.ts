import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { TranslateService } from "@ngx-translate/core";
import { HotToastService } from "@ngneat/hot-toast";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { Role } from "../../../@core/models/Role";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { takeUntil } from "rxjs/operators";

@Component({
	selector: "app-streams",
	templateUrl: "./streams.component.html",
	styleUrls: ["./streams.component.scss"]
})
export class StreamsComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	routeId: any;
	pendingValue: string;
	selectedForm: any | null;
	teachers: any;
	schoolTypeData!: SchoolTypeData;
	userRoles!: Role;
	streamsObj: any;
	streams: any;
	manageStream = false;
	classDetails: any;
	showClassListUI = false;

	constructor(
		private dataService: DataService,
		private classesService: ClassesService,
		private translate: TranslateService,
		private activatedRoute: ActivatedRoute,
		private toastService: HotToastService,
		public location: Location,
		private rolesService: RolesService,
		private responseHandler: ResponseHandlerService) {
		this.pendingValue = "";
		this.selectedForm = null;
	}

	ngOnInit(): void {
		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");
		if (this.routeId) this.getStreams(this.routeId);
		this.getSchoolTypeData();
		this.getUserRoles();
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe(val => {
			this.schoolTypeData = val;
		});
	}

	getUserRoles() {
		this.rolesService.roleSubject.subscribe((roles) => {
			this.userRoles = roles;
		});
	}

	getStreams(id: any) {
		this.classesService.getStreams(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: val => {
					this.streamsObj = val;
					this.streams = this.streamsObj.streams;
					this.teachers = this.streamsObj.teachers;
				},
				error: error => {
					this.responseHandler.error(error, "getStreams()");
				}
			});
	}

	get canManageStream() {
		return this.userRoles?.isSchoolAdmin;
	}

	assignClassTeacher(streamId: number, selectedTeacher: any) {
		this.classesService.assignClassTeacher(streamId, selectedTeacher)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: data => {
					this.toastService.success("Class Teacher rights assigned successfully");

					this.streamsObj = data;
					this.streams = this.streamsObj.streams;
					this.teachers = this.streamsObj.teachers;
				},
				error: error => {
					this.responseHandler.error(error, "assignClassTeacher()");
				}
			});
	}

	saveStreamName(stream: any) {
		this.classesService.save_streamName(stream)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: any) => {
					this.responseHandler.success(data);
				},
				error: error => {
					this.responseHandler.error(error, "saveStreamName()");
				}
			}
			);
	}

	removeClassTeacher(streamId: number) {
		this.classesService.deleteClassTeacher(streamId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: data => {
					this.toastService.success("Class Teacher rights successfully revoked!");
					this.streamsObj = data;
					this.streams = this.streamsObj.streams;
					this.teachers = this.streamsObj.teachers;
				},
				error: error => {
					this.responseHandler.error(error, "removeClassTeacher()");
				}
			});
	}

	deleteStream(form: any, stream: any, streamid: number) {
		Swal.fire({
			title: this.translate.instant("classes.streams.swal.titleDeleteStream", { formOrYear: this.schoolTypeData.formoryear, form: form, stream: stream }),
			text: this.translate.instant("classes.streams.swal.textDeleteStream"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			confirmButtonText: this.translate.instant("classes.streams.swal.confirmButtonTextDeleteStream")
		}).then((result) => {
			if (result.isConfirmed) {
				this.classesService.deleteStream(streamid)
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (data: any) => {
							this.getStreams(this.routeId);
							Swal.fire(
								this.translate.instant("classes.streams.swal.titleRemoveDeleteStreamSuccess"),
								`${data?.message}`,
								"success"
							);
						},
						error: error => {
							Swal.fire(
								this.translate.instant("classes.streams.swal.titleRemoveDeleteStreamError"),
								`${error?.error?.message}!`,
								"warning"
							);
						}
					});
			}
		});
	}

	public edit(form: any): void {

		this.pendingValue = form.stream;
		this.selectedForm = form;

	}

	public cancel(): void {

		this.selectedForm = null;

	}

	public processChanges(): void {

		if (this.pendingValue !== this.selectedForm!.stream) {
			this.selectedForm!.stream = this.pendingValue;
			this.saveStreamName(this.selectedForm);
		}

		this.selectedForm = null;

	}

	showClassListDisplay(classDetails: any) {
		this.classDetails = classDetails;
		this.showClassListUI = true;
	}

	hideClassListDisplay() {
		this.classDetails = null;
		this.showClassListUI = false;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
