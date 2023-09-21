import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
	selector: "app-message-sent",
	templateUrl: "./message-sent.component.html",
	styleUrls: ["./message-sent.component.scss"]
})
export class MessageSentComponent implements OnInit {
  @Output() closeSuccessDialog: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {}

  closeDialog() {
  	this.closeSuccessDialog.emit();
  }

}
