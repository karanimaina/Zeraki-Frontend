import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-progress-micropayment",
	templateUrl: "./progress-micropayment.component.html",
	styleUrls: ["./progress-micropayment.component.scss"]
})
export class ProgressMicropaymentComponent implements OnInit {
  @Input() stage = 1;
  @Input() setup = false;
  @Input() payment = false;
  
  constructor() { }

  ngOnInit(): void {}

}
