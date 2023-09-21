import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
	selector: "app-zeraki-patners-top-nav",
	templateUrl: "./zeraki-patners-top-nav.component.html",
	styleUrls: ["./zeraki-patners-top-nav.component.scss"]
})
export class ZerakiPatnersTopNavComponent implements OnInit {

  @Input() showMySchools!:boolean;
  @Input() showAccountDetails!:boolean;

  @Output() onMyMenuClicked:EventEmitter<any> = new EventEmitter();


  constructor() { }

  ngOnInit(): void {
  }

  myMenuClicked():void{
  	this.onMyMenuClicked.emit();
  }

}
