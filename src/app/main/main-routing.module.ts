import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AccountActiveGuard } from "../@core/shared/guards/account-active.guard";
import { OnlyTeacherGuard } from "../@core/shared/guards/only-teacher.guard";
import { MainComponent } from "./main.component";
import { AdminOrStudentOrTeacherGuard } from "../@core/shared/guards/admin-or-student-or-teacher.guard";
import { NotStudentGuard } from "../@core/shared/guards/not-student.guard";
import { NetworkGuard } from "../@core/shared/guards/network/network.guard";
import { FinanceGuard } from "../@core/shared/guards/finance/finance.guard";
import { SwitchingSchoolComponent } from "./switching-school/switching-school.component";
import { AuthGuardService } from "../@core/shared/guards/auth/auth-guard.service";


const routes: Routes = [
	{
		path: "",
		component: MainComponent,
		canActivate: [AuthGuardService],
		canActivateChild: [NetworkGuard],
		children: [
			{
				path: "bom", canActivate: [AccountActiveGuard, OnlyTeacherGuard], loadChildren: () => import("./bom/bom.module").then(m => m.BomModule),
			},
			{
				path: "classes", canActivate: [AccountActiveGuard, OnlyTeacherGuard], loadChildren: () => import("./classes/classes.module").then(m => m.ClassesModule),
			},
			{
				path: "dashboard", canActivate: [AccountActiveGuard, NotStudentGuard], loadChildren: () => import("./dashboard/dashboard.module").then(m => m.DashboardModule),
			},
			{
				path: "events", canActivate: [AccountActiveGuard], loadChildren: () => import("./events/events.module").then(m => m.EventsModule),
			},
			{
				path: "exams", canActivate: [AccountActiveGuard], loadChildren: () => import("./exams/exams.module").then(m => m.ExamsModule),
			},
			{
				path: "evaluation", canActivate: [AccountActiveGuard], loadChildren: () => import("./evaluation/evaluation.module").then(m => m.EvaluationModule),
			},
			{
				path: "messages", canActivate: [AccountActiveGuard], loadChildren: () => import("./messages/messages.module").then(m => m.MessagesModule),
			},
			{
				path: "behaviour", canActivate: [AccountActiveGuard], loadChildren: () => import("./behaviour/behaviour.module").then(m => m.BehaviourModule),
			},
			{
				path: "printouts", canActivate: [AccountActiveGuard, AdminOrStudentOrTeacherGuard], loadChildren: () => import("./printouts/printouts.module").then(m => m.PrintoutsModule),
			},
			{
				path: "staff", canActivate: [AccountActiveGuard, OnlyTeacherGuard], loadChildren: () => import("./staff/staff.module").then(m => m.StaffModule),
			},
			{
				path: "students", canActivate: [AccountActiveGuard], loadChildren: () => import("./students/students.module").then(m => m.StudentsModule),
			},
			{
				path: "teachers", canActivate: [AccountActiveGuard, OnlyTeacherGuard], loadChildren: () => import("./teachers/teachers.module").then(m => m.TeachersModule),
			},
			{
				path: "settings", canActivate: [AccountActiveGuard], loadChildren: () => import("./settings/settings.module").then(m => m.SettingsModule),
			},
			{
				path: "finance", canActivate: [AccountActiveGuard, FinanceGuard], loadChildren: () => import("./finance/finance.module").then(m => m.FinanceModule),
			},
			{
				path: "learning", canActivate: [AccountActiveGuard], loadChildren: () => import("./learning/learning.module").then(m => m.LearningModule),
			},
			{
				path: "timetable", canActivate: [AccountActiveGuard, OnlyTeacherGuard], loadChildren: () => import("./timetable/timetable.module").then(module => module.TimetableModule),
			},
			{
				path: "shop/:params", canActivate: [AccountActiveGuard], loadChildren: () => import("./shop/shop.module").then(module => module.ShopModule),
			},
			{
				path: "opportunities", canActivate: [AccountActiveGuard], loadChildren: () => import("./opportunities/opportunities.module").then(module => module.OpportunitiesModule),
			},
			// {
			// 	path: "invoicing", canActivate: [OnlyTeacherGuard], loadChildren: () => import("../lock/lock.module").then(module => module.InvoiceModule)
			// },
			{
				path: "change-password", loadChildren: () => import("./change-password/change-password.module").then(module => module.ChangePasswordModule)
			},
			{
				path: "partner", loadChildren: () => import("./zeraki-partners/zeraki-partners.module").then(m => m.ZerakiPartnersModule)
			},
			{
				path: "switching-school", component: SwitchingSchoolComponent
			},
			{ path: "", redirectTo: "dashboard", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MainRoutingModule { }
