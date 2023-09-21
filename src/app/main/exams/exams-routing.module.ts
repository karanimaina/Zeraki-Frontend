import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import { OnlyTeacherGuard } from "src/app/@core/shared/guards/only-teacher.guard";
import * as exams from "./index";

const routes: Routes = [
	{
		path: "", component: exams.ExamsComponent, canActivateChild: [NetworkGuard],
		children: [
			{
				path: "my-classes",
				loadChildren: () => import("./my-classes/my-classes.module").then(m => m.ClassesModule)
			},
			{
				path: "manage",
				loadChildren: () => import("./manage-exam/manage-exam.module").then(m => m.ExamManagementModule)
			},
			{
				path: "grading-systems",
				canActivate: [OnlyAdminGuard],
				loadChildren: () => import("./grading-system/grading-system.module").then(m => m.GradingSystemModule)
			},
			{
				path: "subject-paper-ratios",
				canActivate: [OnlyAdminGuard],
				loadChildren: () => import("./subject-paper-ratios/subject-paper-ratios.module").then(m => m.SubjectPaperRatiosModule)
			},
			{
				path: "create-exam",
				canActivate: [OnlyAdminGuard],
				loadChildren: () => import("./create-exam/create-exam.module").then(m => m.CreateExamModule)
			},
			{
				path: "deleted-exams",
				canActivate: [OnlyAdminGuard],
				loadChildren: () => import("./deleted-exams/deleted-exams.module").then(m => m.DeletedExamsModule)
			},
			{
				path: "coefficient-system",
				canActivate: [OnlyAdminGuard],
				loadChildren: () => import("./coefficient-system/coefficient-system.module").then(module => module.CoefficientSystemModule)
			},
			{
				path: "mentions",
				canActivate: [OnlyTeacherGuard],
				loadChildren: () => import("./grading-system/grading-system.module").then(m => m.GradingSystemModule)
			},
			{ path: "", redirectTo: "my-classes", pathMatch: "full" },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ExamsRoutingModule { }
