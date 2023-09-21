import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as student from "./index";
import { StudentAnalyticsSubjectComponent } from "./student-analytics-subject/student-analytics-subject.component";

const routes: Routes = [
	{
		path: "",
		component: student.StudentsComponent,
		canActivateChild: [NetworkGuard],
		children: [
			{ path: "search", component: student.SearchStudentComponent },
			{
				path: "new",
				canActivate: [OnlyAdminGuard],
				component: student.NewStudentComponent
			},
			{
				path: "uPrf",
				canActivate: [OnlyAdminGuard],
				component: student.UpdateProfileComponent
			},
			{ path: "prof/:id", component: student.StudentProfileComponent },
			{
				path: "dpn/:id",
				canActivate: [OnlyAdminGuard],
				component: student.DisciplineComponent
			},
			{
				path: "act/:id",
				canActivate: [OnlyAdminGuard],
				component: student.StudentActivitiesComponent
			},
			{ path: "msg/:id", component: student.StudentMessagesComponent },
			{ path: "analytics/:id", component: student.StudentAnalyticsComponent },
			{
				path: "analytics-subject/:userid/:subjectid/:seriesid/:egroupid",
				component: StudentAnalyticsSubjectComponent
			},
			{
				path: "uDp",
				canActivate: [OnlyAdminGuard],
				component: student.UpdatePhotoComponent
			},
			{
				path: "mvSt",
				canActivate: [OnlyAdminGuard],
				component: student.MoveStudentComponent
			},
			{ path: "upStGrades", component: student.UploadTargetComponent },
			{
				path: "upFeeStmts",
				canActivate: [OnlyAdminGuard],
				component: student.UploadFeeComponent
			},
			{
				path: "stRes",
				canActivate: [OnlyAdminGuard],
				loadChildren: () =>
					import("./student-residences/student-residences.module").then(
						(module) => module.StudentResidencesModule
					)
			},
			{ path: "", redirectTo: "search", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StudentsRoutingModule {}
