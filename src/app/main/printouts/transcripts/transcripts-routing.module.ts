import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TranscriptsComponent } from "./transcripts.component";

const routes: Routes = [
	{ path: "", component: TranscriptsComponent },
	{ path: ":userid", component: TranscriptsComponent },
	{ path: ":userid/:streamid", component: TranscriptsComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TranscriptsRoutingModule { }
