import { NgModule } from "@angular/core";

import { UsersRoutingModule } from "./users-routing.module";
import { UsersComponent } from "./users.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { UsersListComponent } from "./pages/users-list/users-list.component";
import { UserAdditionModalComponent } from "./components/user-addition-modal/user-addition-modal.component";
import { UserUpdateModalComponent } from "./components/user-update-modal/user-update-modal.component";
import { UsersFilterComponent } from "./components/users-filter/users-filter.component";


@NgModule({
	declarations: [
		UsersComponent,
		UsersListComponent,
		UserAdditionModalComponent,
		UserUpdateModalComponent,
		UsersFilterComponent
	],
	imports: [
		SharedModule,
		UsersRoutingModule
	]
})
export class UsersModule { }
