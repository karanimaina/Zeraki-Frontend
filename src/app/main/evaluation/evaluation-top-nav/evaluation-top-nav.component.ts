import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "app-evaluation-top-nav",
	templateUrl: "./evaluation-top-nav.component.html",
	styleUrls: ["./evaluation-top-nav.component.scss"]
})
export class EvaluationTopNavComponent implements OnInit {
  @Input() linkTitle!: string;
  @Input() linkUrl!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
