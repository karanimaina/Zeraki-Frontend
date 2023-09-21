import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import * as Excel from "exceljs";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-marklist",
	templateUrl: "./marklist.component.html",
	styleUrls: ["./marklist.component.scss"]
})
export class MarklistComponent implements OnInit {

	routeParams: any;
	results: any;
	schoolInfo: any;
	school: any;
	schoolLogo: any = "";

	marklisttype: any = 1;
	examname: any = "";
	class_full_name: any = "";
	titles: any[] = [];
	data: any[] = [];
	cols = 0;
	formOrYear: any = "";

	constructor(
		private route: ActivatedRoute,
		private examService: ExamService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private schoolService: SchoolService
	) { }

	ngOnInit(): void {
		this.loadSchoolInfo();
		this.route.params.subscribe(r => {
			this.routeParams = r;
			this.loadExamDetails();
		});
	}

	loadSchoolInfo() {
		this.schoolService.schoolInfo.subscribe(
			(res) => {
				this.school = res;
			}
		);
		this.dataService.schoolData.subscribe(
			(res) => {
				this.schoolInfo = res;
				this.schoolLogo = res?.logo;
			}
		);
	}

	loadExamDetails() {
		let url = "";
		let param = "";
		if (this.routeParams.classId > 0) {
			if (this.routeParams.paperId != undefined &&
				this.routeParams.paperId != null &&
				this.routeParams.paperId > 0) {
				param = "?paperid=" + this.routeParams.paperId;
			}
			url = `results/edit/${this.routeParams.seriesId}/${this.routeParams.classId}`;
		} else if (this.routeParams.streamId > 0) {
			url = `results/studentslist/series/${this.routeParams.seriesId}`;
			param = "?streamid=" + this.routeParams.streamId;
		} else if (this.routeParams.intakeId > 0) {
			url = `results/studentslist/series/${this.routeParams.seriesId}`;
			param = "?intakeid=" + this.routeParams.intakeId;
		}
		console.warn("param >> ", param);
		this.dataService.get(url + param).subscribe((res) => {
			console.warn(res);
			this.results = res;
			this.initComponent();
		}, (err) => {
			//console.log(err)
		});
	}

	downloadAsSpreedSheet() {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno", width: 10 },
			{ key: "name", width: 10 },
			{ key: "stream", width: 10 },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`exams.markList.excelDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		// translations
		const workSheetName = this.translate.instant("exams.markList.excelDownload.workSheetName");
		const markList = this.translate.instant("exams.markList.excelDownload.markList");

		const admissionNumberColName = this.translate.instant("exams.markList.excelDownload.workSheetColumnHeaders.admno");
		const nameColName = this.translate.instant("exams.markList.excelDownload.workSheetColumnHeaders.name");
		const streamColName = this.translate.instant("exams.markList.excelDownload.workSheetColumnHeaders.stream");

		// const headerColumns: any = ["ADMNO", "NAME", "STREAM"];
		const headerColumns: any = [...columns];

		this.titles.forEach((title: any) => {
			headerColumns.push(title.toString().toUpperCase());
		});

		const options: any = {
			// name:10,
			// admNo:10,
			// stream:10
			[nameColName]: 10,
			[admissionNumberColName]: 10,
			[streamColName]: 10
		};

		const data: any = [];
		this.data.forEach((d: any, i: number) => {
			const dt: any = [];

			this.titles.forEach((t) => {
				if (d[t]?.grade != "X" && d[t]?.grade != "Y") {
					dt.push(d[t]?.raw);
				}
				if (d[t]?.grade == "X" || d[t]?.grade == "Y") {
					dt.push(d[t]?.grade);
				}
			});

			const dd = [d.admno, d.name, d.stream];

			options[nameColName] = (d.name.toString().length > options[nameColName]) ? d.name.toString().length + 4 : options[nameColName];
			options[admissionNumberColName] = (d.admno.toString().length > options[admissionNumberColName]) ? d.admNo.toString().length + 4 : options[admissionNumberColName];
			options[streamColName] = (d.stream.toString().length > options[streamColName]) ? d.stream.toString().length + 4 : options[streamColName];

			data.push(dd.concat(dt));
		});

		let title = "";
		this.results.series ? (title = this.results.series) : (title = this.schoolInfo?.formoryear + " " + this.results?.form + " " + this.results?.stream + " " + this.results?.subject + " - " + markList);
		console.warn("title >> ", title);

		this.examService.generateMarkList(title, headerColumns, data, options, workSheetName).subscribe(
			(res) => {
				console.log(res);

				const message = this.translate.instant("exams.markList.toastMessages.excelDownloadSuccess");
				this.toastService.success(message);
			}, (err) => {
				//console.log(err);
				const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.warning(errorMsg);
			});

	}

	downloadAsPdf(printSectionId: any) {

		const innerContents = document?.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open("", "_blank", "width=device-width");
		popupWinindow?.document.open();
		popupWinindow?.document.write(`
    <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="../../../../styles.scss">
          <link rel="stylesheet" href="../../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="../../../../assets/css/vendors_css.css">
          <style>
          img{
            height:90px;
          }
          h3,h4,p{
            font-size:smaller
          }
          table > thead > tr > td, table > thead > tr > th {
            padding: 0.3rem 0.3rem !important;
            vertical-align: middle !important;
          }
          .col-sm-3{
            width:25% !important;
          }
          .col-sm-5{
            width:40% !important;
          }
          .col-sm-4{
            width:32% !important
          }
          </style>
          <script>window.onload= function () { window.print();window.close();   }  </script>
        </head>
        <body>${innerContents}</body>
     </html>`);
		// popupWinindow?.document.write('<!DOCTYPE html><html><head><link rel="stylesheet" href="assets_new/styles/vendor.cf60403d.css"><link rel="stylesheet" href="assets_new/styles/style.bb02c2e3.css"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>' + innerContents + '</html>');
		popupWinindow?.document.close();

	}




	initComponent() {
		if (this.routeParams.classId > 0) {
			this.marklisttype = 2;
			this.examname = this.results.examname;
			this.class_full_name = this.formOrYear + this.results.form + " " + this.results.stream + " " + this.results.subject;
			this.titles = [];
			this.titles.push("MARKS");
			this.results.list.forEach((d: any, j: number) => {
				d.MARKS = {};
				d.MARKS.raw = d.raw;
				d.MARKS.grade = d.grade;
			});

			this.data = this.results.list;
			this.cols = 8;
		} else if (this.routeParams.streamId > 0) {
			this.examname = this.results.series;
			this.class_full_name = this.formOrYear + this.results.class + " " + this.results.stream;
			this.titles = this.results.subjects;
			this.data = this.results.list;
			this.cols = this.titles.length + 4;
		} else if (this.routeParams.intakeId > 0) {

			this.examname = this.results.series;
			this.class_full_name = this.formOrYear + this.results.class;
			this.titles = this.results.subjects;
			this.data = this.results.list;
			this.cols = this.titles?.length + 4;
		}
	}

	downloadSpreadsheet() {
		// if (this.routeParams.classid.length > 0) {
		//     export_subject_results(this.formOrYear, this.user_info.schoolname, this.results, this.results.form, this.results.stream, true);
		// } else {
		//     this.results.examname = this.results.series;
		//     this.results.preliminary = true;
		//     if (this.routeParams.streamid.length > 0) {
		//         export_class_results(this.formOrYear, this.user_info.schoolname, this.results, this.results.stream);
		//     } else {
		//         export_class_results(this.formOrYear, this.user_info.schoolname, this.results, "");
		//     }
		// }
	}

}
