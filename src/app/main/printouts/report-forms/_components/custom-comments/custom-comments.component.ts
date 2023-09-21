/* eslint-disable indent */
import { Component, Input } from "@angular/core";
import {StudentReport} from "../../../../../@core/models/printouts/report-forms/student-report";

@Component({
  selector: "app-custom-comments",
  templateUrl: "./custom-comments.component.html",
  styleUrls: ["./custom-comments.component.scss"]
})
export class CustomCommentsComponent {

  @Input() studentReport!: StudentReport;
  @Input() hasCustomComments!: boolean;
  @Input() showCustomComments:any;

}
