import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SignUpsComponent } from "./signups.component";

const routes: Routes = [
	{
		path: "",
		component: SignUpsComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SelfSignUpRoutingModule { }
