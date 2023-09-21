import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-setup-welcome",
	templateUrl: "./setup-welcome.component.html",
	styleUrls: ["./setup-welcome.component.scss"]
})
export class SetupWelcomeComponent implements OnInit {

	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	constructor(private rolesService: RolesService) { }

	ngOnInit(): void {}

}
