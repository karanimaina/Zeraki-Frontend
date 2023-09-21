import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CteacherOrAdminGuard } from "src/app/@core/shared/guards/cteacher-or-admin.guard";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as classes from "./index";

const routes: Routes = [
	{
		path: "",
		component: classes.ClassesComponent,
		canActivateChild: [NetworkGuard],
		children: [
			{
				path: "manage",
				component: classes.ManageComponent
			},
			{ path: "manage/streams/:id", component: classes.StreamsComponent },
			{
				path: "manage/classes/:id",
				canActivate: [CteacherOrAdminGuard],
				component: classes.ManageStreamComponent
			},
			{
				path: "manage/streams/subjects/:streamId/:id",
				component: classes.ManageSubjectComponent
			},
			{ path: "myclass", component: classes.MyClassesComponent },
			{ path: "myclass/sc/:id", component: classes.SubjectCommentsComponent },
			{
				path: "add",
				canActivate: [OnlyAdminGuard],
				component: classes.NewComponent
			},
			{
				path: "olevel/subjects",
				canActivate: [OnlyAdminGuard],
				component: classes.OlevelSubjectsComponent
			},
			{
				path: "olevel/subjects/topics/:subjectId",
				canActivate: [OnlyAdminGuard],
				component: classes.SubjectTopicsComponent
			},
			{
				path: "olevel/subjects/topics/competencies/:topicId",
				canActivate: [OnlyAdminGuard],
				component: classes.TopicCompetenciesComponent
			},
			{
				path: "manage/streams/add/:streamid",
				canActivate: [OnlyAdminGuard],
				component: classes.NewComponent
			},
			{
				path: "myclass/attendance/:streamId",
				component: classes.TakeAttendanceComponent
			},
			{
				path: "myclass/attendance-report/:streamId",
				component: classes.AttendanceReportComponent
			},
			{ path: "", redirectTo: "myclass", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ClassesRoutingModule {}
