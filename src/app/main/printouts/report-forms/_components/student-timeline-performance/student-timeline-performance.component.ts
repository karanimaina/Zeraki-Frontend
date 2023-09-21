/* eslint-disable indent */
/* eslint-disable no-mixed-spaces-and-tabs */
import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import * as Highcharts from "highcharts";
import {StudentReport} from "../../../../../@core/models/printouts/report-forms/student-report";

@Component({
	selector: "app-student-timeline-performance",
	templateUrl: "./student-timeline-performance.component.html",
	styleUrls: ["./student-timeline-performance.component.scss",
		"../../report-forms.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentTimelinePerformanceComponent implements OnInit {

  @Input() studentReport!: StudentReport;

  HighCharts: typeof Highcharts = Highcharts;
  timeSeriesChart!: Highcharts.Options;

  ngOnInit() {
    const examsLabel = this.studentReport.timeSeries.examsCombined.combinedExams.map(exam => exam.name);
    const examsScore = this.studentReport.timeSeries.examsCombined.combinedExams.map(exam => exam.value);

    this.timeSeriesChart = {
      credits: { enabled: false },
      chart: {
        height: 280,
        animation: false,
        width:700
      },
      boost: {
        enabled: true,
        seriesThreshold: 50,
        useGPUTranslations: false,
        usePreallocated: false
      },
      title: {
        text: ""
      },
      legend: {
        enabled: false
      },
      xAxis: {
        type: "category",
        categories: examsLabel,
        tickmarkPlacement: "on",
        gridLineColor: "rgba(228, 229, 231, 0.60)",
        labels: {
          style: { textOverflow: "none" },
          autoRotation: [-45, -90]
        }
      },
      yAxis: {
        title: { text: "", align: "high" },
        min: this.studentReport.timeSeries.examsCombined.min,
        max: this.studentReport.timeSeries.examsCombined.max,
      },
      series: [{
        name:"performance",
        colorByPoint: false,
        cursor: "pointer",
        showInLegend: false,
        data: examsScore,
        type: "column",
        animation: false
      }],
    };
  }
}
