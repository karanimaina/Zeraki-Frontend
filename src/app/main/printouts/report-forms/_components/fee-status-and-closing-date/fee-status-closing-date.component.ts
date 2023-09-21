import { Component, Input } from "@angular/core";
import { StudentReport } from "src/app/@core/models/printouts/report-forms/student-report";

@Component({
	selector: "app-fee-status-cred-and-closing-date",
	templateUrl: "./fee-status-closing-date.component.html",
	styleUrls: ["./fee-status-closing-date.component.scss", "./../../report-forms.component.scss"]
})
export class FeeStatusClosingDateComponent {

    @Input() feeData:any;
    @Input() openingDate:any;
    @Input() closingDate:any;
    @Input() showParentSignature = false;
    @Input() showCredentials = false;
	@Input() studentReport!: StudentReport;

}
