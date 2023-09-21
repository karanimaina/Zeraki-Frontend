import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
	selector: "app-student-house-list",
	templateUrl: "student-house-list.component.html",
	styleUrls: ["student-house-list.component.scss"]
})
export class StudentHouseListComponent implements OnInit {
	residentId = -1;

	constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

	ngOnInit() {
		this.residentId = Number(this.activatedRoute.snapshot.params.id);
	}

	navigateBack() {
		this.router.navigate(["/main/students/stRes"]);
	}
}
