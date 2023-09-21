import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { HotToastService } from "@ngneat/hot-toast";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-publish-status",
	templateUrl: "./publish-status.component.html",
	styleUrls: ["./publish-status.component.scss"]
})
export class PublishStatusComponent implements OnInit {

	routeParams: any;
	exam_publish_status: any;
	streamInfo: any;

	seriesid: any = "";
	show_unpublish_selection = false;
	select_all = false;
	viewonly = false;
	viewonly_int = 0;
	publish_success_status!: boolean;
	error!: boolean;
	error_msg!: string;

	isLoadingBasicDetails = false;
	isLoadingStreamInfo = false;

	get isLoading(): boolean {
		return this.isLoadingBasicDetails && this.isLoadingStreamInfo;
	}

	constructor(private route: ActivatedRoute,
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private location: Location,
		private router: Router
	) { }

	ngOnInit(): void {
		this.initItems();
		this.route.params.subscribe((params: any) => {
			this.routeParams = params;
			this.seriesid = params.seriesId;
			this.loadBasicDetails(params.streamId);
			this.loadStreamInfo(params.seriesId, params.streamId);

		});
	}

	loadBasicDetails(streamId: any) {
		this.isLoadingBasicDetails = true;

		this.examService.getSubjectDetailsPublishStatus(streamId).subscribe(
			(res) => {
				this.streamInfo = res;
				console.log(this.streamInfo);
				this.isLoadingBasicDetails = false;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
				this.isLoadingBasicDetails = false;
			}
		);
	}

	loadStreamInfo(seriesId: any, streamId: any) {
		this.isLoadingStreamInfo = true;

		this.examService.getSubjectPublishStatus(seriesId, streamId).subscribe(
			(res) => {
				this.exam_publish_status = res;
				console.log(res);
				this.isLoadingStreamInfo = false;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
				this.isLoadingStreamInfo = false;
			}
		);
	}




	//   if($stateParams.viewonly != null && $stateParams.viewonly == 1) {
	//   $scope.viewonly = true;
	//   $scope.viewonly_int = 1;
	// }

	selectAllToggle(select_all: any) {
		this.exam_publish_status.subjects.forEach((s: any, i: number) => {
			s.unpublish = select_all;
		});
	}


	toggle_show_unpublish_selection(show: boolean) {
		this.show_unpublish_selection = show;
	}

	go_to_upload_results(p) {
		// manage/publish/status/upload/:classId/:seriesId/:lock
		this.router.navigate(["/main/exams/manage/publish/status/upload", p.classid, this.routeParams.seriesId, 1]);

	}

	uploadResults(p) {
		if (this.viewonly == false) {
			let needs_unpublishing = false;
			this.exam_publish_status.sub;
			this.exam_publish_status.subjects.forEach((s: any, i: number) => {
				if (s.status > 1) {
					needs_unpublishing = true;
				}
			});
			if (needs_unpublishing) {
				if (this.exam_publish_status.historical != undefined && this.exam_publish_status.historical) {
					this.unpublishToAllowMarksEntry(p);
				} else {
					Swal.fire({
						title: this.translate.instant("exams.publishStatus.swal.title"),
						text: this.translate.instant("exams.publishStatus.swal.text"),
						icon: "warning",
						showCancelButton: true,
						confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
					}).then((isConfirm) => {
						if (isConfirm.isConfirmed) {
							this.unpublishToAllowMarksEntry(p);
						}
					});
				}
			} else {
				this.go_to_upload_results(p);
			}
		}
	}
	unpublishToAllowMarksEntry(p) {
		const url = "/results/series/unpublish/resultsentry/" + this.exam_publish_status.exam.seriesid + "/-1" + "?streamid=" + this.routeParams.streamId;
		this.examService.doPostNoParams(url).subscribe((res) => {
			console.log(res.message);

			const message = this.translate.instant("exams.publishStatus.toastMessages.unpublishSuccess");
			this.toastService.success(message);

			console.log(res);
			this.go_to_upload_results(p);
		});
	}

	publishSeries() {
		this.initItems();
		Swal.fire({
			title: this.translate.instant("exams.publishStatus.swal.title"),
			text: this.translate.instant("exams.publishStatus.swal.text2"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				const url = "/results/publish/classteacher/" + this.exam_publish_status.exam.seriesid + "/-1/-1?streamid=" + this.routeParams.streamId;
				this.examService.doPutNoParams(url).subscribe((res) => {
					this.publish_success_status = true;
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.error(message);
					this.error = true;
					this.error_msg = err?.error?.message;
				});
				// liteService.putnoParams("/results/publish/classteacher/" + $scope.exam_publish_status.exam.seriesid + "/-1/-1?streamid=" + $stateParams.streamid, false).then(function (resp) {
				//   if (resp.status == 200) {
				//     $scope.publish_success_status = true;
				//   }
				// }).catch(function (resp) {
				//   $scope.error = true;
				//   $scope.error_msg = "An error occurred";
				//   if (resp.data.message !== undefined) {
				//     $scope.error_msg = resp.data.message;
				//   }
				// });
			}
		});
	}
	unpublishSeries() {
		Swal.fire({
			title: this.translate.instant("exams.publishStatus.swal.title"),
			text: this.translate.instant("exams.publishStatus.swal.text3"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				const subject_to_unpublish: any = [];
				this.exam_publish_status.subjects.forEach((s: any, i: number) => {
					if (s.unpublish) {
						subject_to_unpublish.push(s.classid);
					}
				});
				const url = "/results/series/unpublish/resultsentry/" + this.exam_publish_status.exam.seriesid + "/-1" + "?streamid=" + this.routeParams.streamId;
				this.examService.doPostWithParams(url, subject_to_unpublish).subscribe((res) => {
					console.log(res.message);

					const message = this.translate.instant("exams.publishStatus.toastMessages.unpublishSeriesSuccess");
					this.toastService.success(message);

					const form = -1;
					const newUrl = "/results/unpublished/byexam/" + this.exam_publish_status.exam.seriesid + "/" + form + "?streamid=" + this.routeParams.streamId;
					this.examService.doGet(newUrl).subscribe((res) => {
						this.exam_publish_status = res;
						this.selectAllToggle(false);
						this.toggle_show_unpublish_selection(false);
					});
				}, (err) => {
					console.log(err);
				});
			}
		});
	}

	initItems() {
		this.publish_success_status = false;
		this.error = false;
		this.error_msg = "";
	}

	goBack() {
		this.location.back();
		console.log("Welcome");
	}




}
