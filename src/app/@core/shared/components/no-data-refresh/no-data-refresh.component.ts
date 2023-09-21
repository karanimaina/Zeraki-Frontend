import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
	selector: "app-no-data-refresh",
	templateUrl: "./no-data-refresh.component.html",
	styleUrls: ["./no-data-refresh.component.scss"]
})
export class NoDataRefreshComponent implements OnInit {

  @Input() data: any;
  @Output() retry = new EventEmitter();

  constructor() { }

  ngOnInit(): void {}

  retryFailedRequest(): void {
  	this.retry.emit();
  }

}
