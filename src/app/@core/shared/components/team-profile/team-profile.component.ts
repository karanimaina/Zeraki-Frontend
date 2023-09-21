import { Component, Input, OnInit } from "@angular/core";
import { Team } from "src/app/@core/models/team";
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: "app-team-profile",
	templateUrl: "./team-profile.component.html",
	styleUrls: ["./team-profile.component.scss"]
})
export class TeamProfileComponent implements OnInit {
	@Input()fromParent: any;
	
	team?: Team;
  
	constructor(
		// public activeModal: NgbActiveModal
	) { }

	ngOnInit(): void {
		this.fromParent? this.team = this.fromParent : this.team = new Team();
		// console.log(this.fromParent);
	}

	closeModal(sendData: any) {
	// 	this.activeModal.close(sendData);
	}

}
