import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as Highcharts from "highcharts";

@Component({
	selector: "app-class-report",
	templateUrl: "./class-report.component.html",
	styleUrls: ["./class-report.component.scss"]
})
export class ClassReportComponent implements OnInit {

	isHighcharts = typeof Highcharts === "object";
	HighchartStreams: typeof Highcharts = Highcharts;
	HighchartStreamComparison: typeof Highcharts = Highcharts;
	HighchartStudentsPerGrade: typeof Highcharts = Highcharts;
	HighchartTimeSeries: typeof Highcharts = Highcharts;

  @Input() classData: any;
  @Input() show_top_students: any;
  @Input() selected_kcse_mean: any;
  @Input() school_profile: any;
  @Input() highchart_stream_comparison!: Highcharts.Options;
  @Input() sortdata:any;
  @Input() highchart_subject_mean!: Highcharts.Options;
  @Input() highchart_students_per_grade!: Highcharts.Options;
  @Input() selected_stream_value:any;
  @Input() selected_stream:any;
  @Input() sorthouses:any;
  @Input() highchart_time_series!: Highcharts.Options;

  @Output() showReportEvt: EventEmitter<boolean> = new EventEmitter();
  @Output() printPageEvt: EventEmitter<boolean> = new EventEmitter();
  @Output() onTopStudentsSubjectsChangeEvt: EventEmitter<boolean> = new EventEmitter();
  @Output() onTopStudentsOnlyChangeEvt: EventEmitter<boolean> = new EventEmitter();
  @Output() onKcseMeanChangeEvt: EventEmitter<boolean> = new EventEmitter();

  no_data = false;
  itemsFound = false;

  constructor() {
  	// super(
  	// 	jointService,
  	//   toastService,
  	//   dataService,
  	//   router
  	// );
  }
  ngOnInit(): void {

  	if (this.classData?.current_class_summary_list?.length == 0) {
  		this.no_data = true;
  		this.itemsFound = false;
  	} else {
  		this.no_data = !true;
  		this.itemsFound = !false;
  	}
  }

  hidePrintFormat(): void {
  	this.showReportEvt.emit();
  }

  printPage(name:any) {
  	this.printPageEvt.emit(name);
  }

  onTopStudentsSubjectsChange() {
  	this.onTopStudentsSubjectsChangeEvt.emit();
  }

  onTopStudentsOnlyChange() {
  	this.onTopStudentsOnlyChangeEvt.emit();
  }

  onKcseMeanChange() {
  	this.onKcseMeanChangeEvt.emit();
  }


}
