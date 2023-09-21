import { NgModule } from "@angular/core";

import { UsersRoutingModule } from "./users-routing.module";
import { UsersComponent } from "./users.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { AddComponent } from "./_components/add/add.component";
import { ListComponent } from "./_components/list/list.component";
import { NgSelectModule } from "@ng-select/ng-select";


@NgModule({
	declarations: [UsersComponent, AddComponent, ListComponent],
	imports: [
		UsersRoutingModule,
		SharedModule,
		NgSelectModule
	]
})
export class UsersModule { }
