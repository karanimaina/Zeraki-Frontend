import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";

@Component({
	selector: "app-student-micro-payments",
	templateUrl: "./student-micro-payments.component.html",
	styleUrls: ["./student-micro-payments.component.scss"]
})
export class StudentMicroPaymentsComponent implements OnInit {

  @Input() micropayments?: Array<any> = [];
  @Input() stkData$?: Observable<any>;
  @Output() initiatePayment: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  initPayment() {
  	this.initiatePayment.emit();
  }

}
