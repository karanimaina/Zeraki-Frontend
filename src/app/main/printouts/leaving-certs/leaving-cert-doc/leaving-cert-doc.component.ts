import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PdfMakeWrapper } from "pdfmake-wrapper";
import { Observable } from "rxjs";
import { LeavingCertPdfDoc } from "src/app/@core/models/printouts/leaving-certificates/leaving-cert-pdf-doc";
import { Role } from "src/app/@core/models/Role";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { Student } from "src/app/@core/models/student/student";
import { FormOrYearPipe, SchoolTitlePipe } from "src/app/@core/shared";

@Component({
	selector: "app-leaving-cert-doc",
	templateUrl: "./leaving-cert-doc.component.html",
	styleUrls: ["./leaving-cert-doc.component.scss"]
})
export class LeavingCertDocComponent implements OnInit {

	@Input() studentCertificate: any;
	@Input() schoolTypeData!: SchoolTypeData;
	@Input() schoolProfile!: SchoolInfo;
	@Input() userRoles$!: Observable<Role>;
	@Output() toggleList: EventEmitter<boolean> = new EventEmitter();
	@Output() navigateToStudent: EventEmitter<any> = new EventEmitter();

	pdfSrc: any;
	isExporting = false;
	isLoading = true;

	constructor(
		private schoolTitlePipe: SchoolTitlePipe,
		private formOrYearPipe: FormOrYearPipe,
		private datePipe: DatePipe
	) { }

	ngOnInit(): void {
		this.generateLeavingPdf();
	}

	private generateLeavingPdf() {
		const pdfDoc = new LeavingCertPdfDoc(
			this.studentCertificate,
			"../../../../../assets/img/coa.png",
			this.schoolTitlePipe.transform(this.schoolTypeData?.formoryear),
			this.formOrYearPipe.transform(this.schoolTypeData?.formoryear),
			(this.schoolProfile.logo || "../../../../../assets/img/default-logo.png"),
			this.datePipe.transform(new Date(), "mediumDate")!
		);

		pdfDoc.build().then((pdfDoc: PdfMakeWrapper) => {
			pdfDoc.create().getBlob((blob) => {
				const fileReader = new FileReader();
				fileReader.onload = () => {
					this.pdfSrc = new Uint8Array(fileReader.result as ArrayBuffer);
					this.isLoading = false;
				};
				fileReader.readAsArrayBuffer(blob);
			});
		});
	}

	async downloadPdf(action: "print" | "download") {
		this.isExporting = true;

		const pdfDoc = new LeavingCertPdfDoc(
			this.studentCertificate,
			"../../../../../assets/img/coa.png",
			this.schoolTitlePipe.transform(this.schoolTypeData?.formoryear),
			this.formOrYearPipe.transform(this.schoolTypeData?.formoryear),
			(this.schoolProfile.logo || "../../../../../assets/img/default-logo.png"),
			this.datePipe.transform(new Date(), "mediumDate")!
		);

		pdfDoc.build().then((pdfDoc: PdfMakeWrapper) => {
			if (action === "print") {
				pdfDoc.create().print();
			} else if (action === "download") {
				pdfDoc.create().download(`${this.studentCertificate.student.admissionNumber}_${this.studentCertificate.student.name}`);
			}
		});


		this.isExporting = false;
	}

	hideDocument() {
		this.toggleList.emit();
	}

	editStudent(student: Student) {
		this.navigateToStudent.emit(student);
	}

}
