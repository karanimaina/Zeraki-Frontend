import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "app-report-signatures",
	templateUrl: "./report-signatures.component.html",
	styleUrls: ["../../olevel-report-forms/components/student-report/student-report.component.scss"]
})
export class ReportSignaturesComponent implements OnInit {
	@Input() showClassTeacherSignature!: boolean;
	@Input() classTeacherSignature!: string;
	@Input() classTeacherComment!: string;
	@Input() showClassTeacherComments!: boolean;

	@Input() showHouseTeacherComments!: boolean;
	@Input() showHouseTeacherSignature!: boolean;
	@Input() houseTeacherSignature!: string;
	@Input() houseTeacherComment!: string;

	@Input() principalSignature!: string;
	@Input() showPrincipalSignature!: boolean;
	@Input() showPrincipalComments!: boolean;
	@Input() principalComment!: string;

	constructor() { }

	ngOnInit(): void {
	}

}
