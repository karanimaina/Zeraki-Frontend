import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ZlCredentialsComponent } from "./zl-credentials.component";

const routes: Routes = [{ path: "", component: ZlCredentialsComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ZlCredentialsRoutingModule { }
