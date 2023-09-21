import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AttendanceReport } from "../../../../@core/models/classes/attendance-report";
import { Location } from "@angular/common";
import { DataService } from "../../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-attendance-report",
	templateUrl: "./attendance-report.component.html",
	styleUrls: ["./attendance-report.component.scss"]
})
export class AttendanceReportComponent implements OnInit {
	streamId!: number;
	attendanceReport!: AttendanceReport;
	terms_years: Array<{
    label: string,
    term: number,
    year: number
  }> = [];
	filterByDate!: boolean;
	startDate: any;
	endDate: any;
	loading = false;
	selectedTerm!: { label: string, term: number, year: number };
	schoolTypeData!: SchoolTypeData;

	constructor(private activatedRoute: ActivatedRoute,
              private classesService: ClassesService,
              private location: Location,
              private dataService: DataService) {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.streamId = this.activatedRoute.snapshot.params.streamId;

		this.classesService.getAttendanceReport(this.streamId).subscribe((res) => {
			this.attendanceReport = res;
			this.terms_years = res.term_options.terms_years;

			this.selectedTerm = this.terms_years.find(term => term.term === res.term && term.year === res.year)!;
		});
	}

	navigateBack() {
		this.location.back();
	}

	updateFilter(filterByDate, $event: Event) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			this.filterByDate = filterByDate;
		}else{
			this.filterByDate = null!;
		}
	}


	filter() {
		this.loading = true;
		if (this.filterByDate) {
			const startDate = Date.parse(this.startDate);
			const endDate = Date.parse(this.endDate);
			this.classesService.filterAttendanceReportByDate(startDate, endDate, this.streamId).subscribe((res) => {
				this.loading = false;
				this.attendanceReport = res;
			}, (err) => {
				this.loading = false;
			});
		}else{
			console.log(this.selectedTerm);
			this.classesService.filterAttendanceReportByTerm(this.selectedTerm.term, this.selectedTerm.year, this.streamId).subscribe((res) => {
				this.loading = false;
				this.attendanceReport = res;
			}, (err) => {
				this.loading = false;
			});
		}
	}
}
