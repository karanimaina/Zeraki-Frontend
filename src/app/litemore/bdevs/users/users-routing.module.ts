import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UsersListComponent } from "../../managers/users/pages/users-list/users-list.component";
import { UsersComponent } from "./users.component";
// import { ListComponent } from "./_components/list/list.component";

const routes: Routes = [
	{
		path: "",
		component: UsersComponent,
		children: [
			// { path: "", component: ListComponent }
			{ path: "", component: UsersListComponent }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UsersRoutingModule { }
