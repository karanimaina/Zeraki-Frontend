import { Component } from "@angular/core";
import { SchoolService } from "../@core/shared/services/school/school.service";
import { DataService } from "../@core/shared/services/data/data.service";
import { NetworkService } from "../@core/shared/services/network/network.service";
import { RolesService } from "../@core/shared/services/role/roles.service";
import { SummaryService } from "../@core/shared/services/school/summary/summary.service";
import { UserService } from "../@core/shared/services/user/user.service";
import { MainComponent } from "../main/main.component";

@Component({
	selector: "app-school-setup",
	templateUrl: "./school-setup.component.html",
	styleUrls: ["./school-setup.component.scss"]
})
export class SchoolSetupComponent extends MainComponent {

	constructor(
		summaryService: SummaryService,
		dataService: DataService,
		schoolService: SchoolService,
		rolesService: RolesService,
		userService: UserService,
		networkService: NetworkService,
	) {
		super(
			summaryService,
			dataService,
			schoolService,
			rolesService,
			userService,
			networkService
		);
	}

}
