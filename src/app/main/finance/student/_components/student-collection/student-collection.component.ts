import { Component, Input, OnInit } from "@angular/core";
import { PdfMakeWrapper } from "pdfmake-wrapper";
import { CollectionReceiptDoc } from "src/app/@core/models/finance/collection-receipt";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-student-collection",
	templateUrl: "./student-collection.component.html",
	styleUrls: ["./student-collection.component.scss"]
})
export class StudentCollectionComponent implements OnInit {

	@Input() studentData: any;
	@Input() hasMicropaymentPlan = false;
	schoolInfo!: SchoolInfo;

	constructor(
		private schoolService: SchoolService
	) { }

	ngOnInit(): void {
		this.getSchoolInfo();
	}

	getSchoolInfo() {
		this.schoolService.schoolInfo.subscribe(resp => {
			this.schoolInfo = resp;
		});
	}

	downloadReceipt(studCols: any) {
		const collectionReceiptDoc = new CollectionReceiptDoc(
			this.studentData,
			studCols,
			this.schoolInfo
		).buildReport();

		collectionReceiptDoc.then((pdfDoc: PdfMakeWrapper) => {
			pdfDoc.create().download(`${studCols.studentName || this.studentData?.studentName}_${studCols.amount}_${new Date().getTime()}`);
		});
	}

}
