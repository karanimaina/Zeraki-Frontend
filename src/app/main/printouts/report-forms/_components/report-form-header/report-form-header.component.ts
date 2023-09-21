/* eslint-disable indent */
import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: "app-report-form-header",
  templateUrl: "./report-form-header.component.html",
  styleUrls: ["./report-form-header.component.scss"]
})
export class ReportFormHeaderComponent implements OnInit {
  @Input() schoolProfile:any;
  schoolLogoPath!: string;

  ngOnInit(): void {
    this.schoolLogoPath = this.schoolProfile?.logo || "assets/img/default-logo.png";
  }


}
