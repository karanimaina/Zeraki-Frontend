import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import * as tt from "./index";

const routes: Routes = [
	{
		path : "", component: tt.TimetableComponent, canActivateChild: [NetworkGuard],
		children : [
			{ path: "teacher", component: tt.TeacherTimetableComponent },
			{ path: "class", component: tt.ClassTimetableComponent },
			{ path: "", redirectTo: "teacher", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TimetableRoutingModule { }
