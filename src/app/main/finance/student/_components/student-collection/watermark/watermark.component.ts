import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-watermark",
	templateUrl: "./watermark.component.html",
	styleUrls: ["./watermark.component.scss"]
})
export class WatermarkComponent implements OnInit {
  @Input() schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;

  constructor(private schoolService: SchoolService) { }

  ngOnInit(): void {
  }

}
