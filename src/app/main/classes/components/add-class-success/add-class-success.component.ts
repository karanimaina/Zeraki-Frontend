import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Location } from "@angular/common";

@Component({
	selector: "app-add-class-success",
	templateUrl: "./add-class-success.component.html",
	styleUrls: ["./add-class-success.component.scss"]
})
export class AddClassSuccessComponent implements OnInit {
	@Input() schoolSetup = false;
	@Input() streamDetails!: any;
	@Input() updateSubjects!: boolean;
	@Input() formOrYear!: string;
	@Output() addAnotherSubjectOrClass: EventEmitter<void> = new EventEmitter<void>();

	constructor(private location: Location) { }

	ngOnInit(): void {
	}

	goBack() {
		this.location.back();
	}

	addAnother() {
		this.addAnotherSubjectOrClass.emit();
	}

}
