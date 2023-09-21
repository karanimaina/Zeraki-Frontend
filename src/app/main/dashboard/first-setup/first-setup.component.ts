import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
	selector: "app-first-setup",
	templateUrl: "./first-setup.component.html",
	styleUrls: ["./first-setup.component.scss"]
})
export class FirstSetupComponent implements OnInit {

	constructor(private router:Router) { }

	ngOnInit(): void {
	}

	exitWelcomeScreen(){
		this.router.navigateByUrl("/main/classes/add");
	}

}
