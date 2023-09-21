import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-tz-sec-perf",
	templateUrl: "./tz-sec-perf.component.html",
	styleUrls: ["./tz-sec-perf.component.scss"]
})
export class TzSecPerfComponent implements OnInit {

  @Input() rp: any;
  @Input() show_student_overall_rank = true;
  @Input() show_student_stream_rank = true;
  @Input() show_custom_comments = false;

  constructor() { }

  ngOnInit(): void { }

  trackByFnSubjects(index, item) {
  	return item.subjectid; // unique id corresponding to the item
  }

}
