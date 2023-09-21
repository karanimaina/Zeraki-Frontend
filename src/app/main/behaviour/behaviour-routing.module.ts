import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import * as behaviour from "./index";
import { IntakeBehaviourComponent } from "./intake-behaviour/intake-behaviour.component";
import { ResidenceStudentBehaviourComponent } from "./residence-student-behaviour/residence-student-behaviour.component";
import { StreamBehaviourComponent } from "./stream-behaviour/stream-behaviour.component";
/**
 "residenceid": "26",
  "ayid": "3994",
  "term": "1"
 */
const routes: Routes = [
	{
		path: "", component: behaviour.BehaviourComponent, canActivateChild: [NetworkGuard],
		children: [
			{ path: "class", component: behaviour.ClassBehaviourComponent },
			{ path: "intake/:intakeid/:ayid/:term", component: IntakeBehaviourComponent },
			{ path: "stream/:streamid/:ayid/:term", component: StreamBehaviourComponent },
			{ path: "residence", component: behaviour.ResidenceBehaviourComponent },
			{ path: "residence/students/:residenceid/:ayid/:term", component: ResidenceStudentBehaviourComponent },
			{ path: "new-record", component: behaviour.NewRecordComponent },
			{ path: "infractions-approval", component: behaviour.InfractionsApprovalComponent },
			{ path: "manage", component: behaviour.ManageBehaviourComponent },
			{ path: "student/:userid", component: behaviour.StudentBehaviourComponent },

			{ path: "", redirectTo: "class", pathMatch: "full" },
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BehaviourRoutingModule { }
