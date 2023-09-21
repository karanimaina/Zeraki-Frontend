import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-students-top-nav",
	templateUrl: "./students-top-nav.component.html",
	styleUrls: ["./students-top-nav.component.scss"]
})
export class StudentsTopNavComponent implements OnInit, OnDestroy {
	userRoles!: Role;
	destroy$: Subject<boolean> = new Subject<boolean>();

	constructor(private rolesService: RolesService) {
		this.rolesService.roleSubject.subscribe((role) => {
			this.userRoles = role;
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {}
}
