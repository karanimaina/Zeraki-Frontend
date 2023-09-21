import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-collection-receipt",
	templateUrl: "./collection-receipt.component.html",
	styleUrls: ["./collection-receipt.component.scss"],
})
export class CollectionReceiptComponent implements OnInit {
  @Input() collection?: any;
  @Input() studentData: any;
  today = new Date();

  constructor() {}

  ngOnInit(): void {}
}
