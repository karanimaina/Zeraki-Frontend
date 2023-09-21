import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { StudentReport } from "../../../../../@core/models/printouts/report-forms/student-report";
import { SchoolInfo } from "../../../../../@core/models/school-info";

@Component({
	selector: "app-remarks",
	templateUrl: "./remarks.component.html",
	styleUrls: ["./remarks.component.scss"]
})
export class RemarksComponent implements OnInit {

    @Input() studentReport!: StudentReport;
    @Input() schoolInfo!: SchoolInfo;
    @Input() userRoles$!: Observable<Role>;
    @Input() showClassTeacherComments!: boolean;
    @Input() showCustomComments!: boolean;
    @Input() showClassTeacherSignature!: boolean;
    @Input() showPrincipalComments!: boolean;
    @Input() showPrincipalSignature!: boolean;

    classTeacherSignatureUrl!: string;

    ngOnInit() {
    	this.classTeacherSignatureUrl = this.studentReport?.classTeacher.signature;
    }

}
