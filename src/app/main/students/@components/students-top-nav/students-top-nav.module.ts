import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as student from "../../index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { RouterModule } from "@angular/router";

@NgModule({
	declarations: [student.StudentsTopNavComponent],
	imports: [CommonModule, RouterModule, SharedModule],
	exports: [student.StudentsTopNavComponent]
})
export class StudentsTopNavModule {}
