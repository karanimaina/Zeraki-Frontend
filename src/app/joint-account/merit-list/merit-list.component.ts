import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { JointAccountService } from "src/app/@core/services/exams/joint/joint-account.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { SchoolService } from "../../@core/shared/services/school/school.service";

@Component({
	selector: "app-merit-list",
	templateUrl: "./merit-list.component.html",
	styleUrls: ["./merit-list.component.scss"]
})
export class MeritListComponent implements OnInit {

	routeParams: any = {};
	complete_list: any = {};
	resultsLimit = 0;
	count = 0;
	loadCount = 0;
	data: any;
	dataForDisplay: any[] = [];
	showMoreButton = true;
	showPrintFormat = false;
	isLoading = false;
	hasError = false;
	isMobileApp!: boolean;
	school_profile: any;
	user_info: any;


	constructor(
		private route: ActivatedRoute,
		private jointService: JointAccountService,
		private dataService: DataService,
		private userService: UserService,
		private schoolService: SchoolService) { }

	ngOnInit(): void {
		this.route.params.subscribe((r) => {
			this.routeParams = r;
			this.initContent();
			this.isMobileApp = this.dataService.getIsMobileApp();
		});
		this.schoolService.schoolInfo.subscribe((r) => { this.school_profile = r; });
		this.userService.userInfoSubject.subscribe((r) => { this.user_info = r; });
	}
	initContent() {
		this.getPerformanceList(0);
	}

	getPerformanceList(page?: any, view_print_format?: any, export_to_excel?: any) {
		if (view_print_format) {
			this.showPrintFormat = true;
			setTimeout(() => {
				// this.scrollToId("printthis", true);
			}, 200);
		} else {
			let params = "";
			if (this.routeParams.schoolid > 0) {
				params = "?schoolid=" + this.routeParams.schoolid;
			}

			if (this.routeParams.subjectid > 0) {
				let prefix = "?";
				if (params.length > 0) {
					prefix = "&";
				}
				params += (prefix + "subjectid=" + this.routeParams.subjectid);
			}

			if (view_print_format || export_to_excel) {
				let prefix = "?";
				if (params.length > 0) {
					prefix = "&";
				}
				params += (prefix + "all=true");
				if (export_to_excel) {
					params += "&spreadsheet=true";
				}
			}

			if (this.loadCount == 0) {
				this.isLoading = true;
			}
			this.jointService.doGet("/analytics/jointexam/meritlist" + params).subscribe((resp) => {
				this.isLoading = false;
				this.loadCount++;
				if (view_print_format == undefined && export_to_excel == undefined) {
					this.resultsLimit = 0;
					this.data = resp;
					console.log(this.data);
					this.showMore();
				} else if (view_print_format) {
					//this.complete_list = resp.data;
					this.showPrintFormat = true;
					setTimeout(() => {
						this.scrollToId("printthis", true);
					}, 200);
				} else if (export_to_excel) {
					if (resp.generated_spreadsheet != null) {
						const file_name = resp.generated_spreadsheet;
						// console.log("filename work on me when we get here also");
						this.jointService.doGetWithHeaders("/analytics/examspreadsheet?name=" + file_name + "&joint=true").subscribe(
							(resp_success) => {
								const blob = new Blob([resp_success], { type: "application/vnd.ms-excel" });
								this.jointService.custom_saver(blob, file_name);
							}, (resp_failure) => {
								console.log("Failed >>", resp_failure);
								this.jointService.export_class_results_withLabelsList(this.user_info.schoolname, resp);
							}
						);
						//       $http.get(utilityService.getBaseUrl() + 'api/analytics/examspreadsheet?name=' + file_name + "&joint=true", { responseType: 'arraybuffer' }).then(function (resp_success) {
						//         var blob = new Blob([resp_success.data], { type: "application/vnd.ms-excel" });
						//         custom_saver(blob, file_name);
						//       }).catch(function (resp_failure) {
						//         export_class_results_withLabelsList(this.user_info.schoolname, resp.data);
						//       });
					} else {
						this.jointService.export_class_results_withLabelsList(this.user_info.schoolname, resp);
					}
					// },(e)=>{
					//   this.toastService.warning("An error occured")
					// })

					// liteService.get("api/analytics/jointexam/meritlist" + params).then(function (resp) {
					//
				}
			}, (error) => {
				this.isLoading = false;
				this.hasError = true;
			});
		}
	}

	scrollToId(id, status) {

	}

	exportToExcel() {
		this.getPerformanceList(0, false, true);
	}
	viewPrintFormat() {
		this.getPerformanceList(0, true, false);
	}
	hidePrintFormat() {
		this.showPrintFormat = false;
		this.complete_list = {};
	}
	showMore() {
		const start = this.resultsLimit;
		this.resultsLimit += 50;

		if (this.resultsLimit > this.data?.list?.length) {
			this.resultsLimit = this.data?.list?.length;
		}
		if (this.data?.list.length > 0 && this.resultsLimit < this.data?.list?.length) {
			this.showMoreButton = true;
			this.dataForDisplay = [...this.dataForDisplay, ...this.data.list.slice(start, this.resultsLimit)];
		} else {
			this.showMoreButton = false;
		}
	}

	_printPage(printSectionId: string) {

		const innerContents = document?.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open("", "_blank", "width=device-width");
		popupWinindow?.document.open();
		popupWinindow?.document.write("<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"assets_new/styles/vendor.cf60403d.css\"><link rel=\"stylesheet\" href=\"assets_new/styles/style.bb02c2e3.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" + innerContents + "</html>");
		popupWinindow?.document.close();
	}

	printPage(printSectionId: string) {
		const innerContents = document.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		// <link rel="stylesheet"
		//           href="../../../styles.scss">
		//       <link rel="stylesheet"
		//           href="../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css">
		//       <link rel="stylesheet" href="../../../assets/css/vendors_css.css
		const popupWinindow = window.open("", "_blank", "width=device-width");
		// popupWinindow?.document.open();
		popupWinindow?.document.write(`
    <!DOCTYPE html>
      <html>
        <head>
            <link rel="stylesheet" href="../../../../styles.scss">
          <link rel="stylesheet" href="../../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="../../../../assets/css/vendors_css.css">
          <style>
          table th,table td{
            padding: 3px;
            font-size: 13pt;
          }
          </style>
            <script>window.onload= function () { window.print();window.close();   }
            </script>

        </head>
        <body>${innerContents}</body>
      </html>`);
		popupWinindow?.document.close();
	}



}
