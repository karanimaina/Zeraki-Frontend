import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { Location } from "@angular/common";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";

@Component({
	selector: "app-add",
	templateUrl: "./add.component.html",
	styleUrls: ["./add.component.scss"]
})
export class AddComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	usersForm!: SubmitFormGroup;
	isAdding = false;
	@ViewChild("closeUserModal") closeUserModal?: ElementRef;

	userRoles = [
		{ name: "Regional Manager", value: "isRegionalManager" },
		{ name: "Relationship Manager", value: "isRelationshipManager" },
		{ name: "Revenue Officer", value: "isRevenueOfficer" },
		{ name: "CX", value: "isCxTeamMember" },
		{ name: "Bdev Manager", value: "isBDevManager" }
	];

	constructor(private location: Location) {
		// when location change...
		this.location.subscribe(location => {
			// ...close modal popup
			this.closeUserModal?.nativeElement.click();
		});
	}

	ngOnDestroy(): void { }

	ngOnInit(): void {
		this.bindForm();
	}

	bindForm() {
		this.usersForm = new SubmitFormGroup({
			username: new FormControl("", [emptyStringValidator]),
			name: new FormControl("", emptyStringValidator),
			selectedRoles: new FormControl("", Validators.required),
		});
	}

	get selectedRoles() { return this.usersForm.get("selectedRoles"); }
	get username() { return this.usersForm.get("username"); }
	get name() { return this.usersForm.get("name"); }


	addUser() {
		console.warn("Form value >> ", this.usersForm.value);
		// ...close modal popup
		this.closeUserModal?.nativeElement.click();
	}

}
