import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-finance-top-nav",
	templateUrl: "./finance-top-nav.component.html",
	styleUrls: ["./finance-top-nav.component.scss"]
})
export class FinanceTopNavComponent implements OnInit {
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	constructor(private rolesService: RolesService) { }

	ngOnInit(): void {}

}
