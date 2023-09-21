import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgForm } from "@angular/forms";

@Component({
	selector: "app-account-details",
	templateUrl: "./account-details.component.html",
	styleUrls: ["./account-details.component.scss"]
})
export class AccountDetailsComponent implements OnInit {

  //vars from parent
  @Input() accountDetails: any;
  @Input() isLoadingAccountDetails?: boolean;
  @Input() isUpdatingAccountDetails?:boolean;



  //send event to parent
  @Output() updateAccountEvent: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  updateAccountDetails(form: NgForm) {
  	if (form.invalid)
  		return;

  	this.updateAccountEvent.emit(form.value);
  }


}
