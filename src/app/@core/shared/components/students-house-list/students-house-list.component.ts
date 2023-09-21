import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PrintoutsService } from "../../../services/printouts/printouts.service";
import { SchoolService } from "../../services/school/school.service";
import { TranslateService } from "@ngx-translate/core";
import { SchoolInfo } from "../../../models/school-info";
import { ClassListPdfDoc } from "../../../models/printouts/class-list/class-list-pdf-doc";
import { finalize, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { downloadActions } from "src/app/@core/types/download-actions";
import { PdfMakeWrapper } from "pdfmake-wrapper";

@Component({
	selector: "app-students-house-list",
	templateUrl: "./students-house-list.component.html",
	styleUrls: ["./students-house-list.component.scss"]
})
export class StudentsHouseListComponent implements OnInit {
	destroy$: Subject<boolean> = new Subject();
	@Input() residentId!: number;
	@Input() intakeId?: number;
	@Input() streamId?: number;
	@Input() showBackAction = false;
	@Output() navigateBackEvt: EventEmitter<any> = new EventEmitter<any>();
	students: any = {};
	school!: SchoolInfo;
	documentTitle = "";
	documentHeaders: Array<{ key: string; value: string; widthClass?: string }> = [];
	isLoading = true;
	pdfSrc!: Uint8Array;
	isDownloading = false;
	isError = false;

	constructor(
		private printoutService: PrintoutsService,
		private schoolService: SchoolService,
		private translate: TranslateService
	) {}

	ngOnInit(): void {
		this.translate
			.get(["workSheet.headers.admno", "common.name", "common.kcpe"])
			.subscribe((headers) => {
				this.documentHeaders = [
					{
						key: "#",
						value: "#"
					},
					{
						key: "admno",
						value: headers["workSheet.headers.admno"].toUpperCase()
					},
					{
						key: "name",
						value: headers["common.name"].toUpperCase()
					},
					{
						key: "kcpe",
						value: headers["common.kcpe"].toUpperCase()
					}
				];
			});

		this.initSchoolInfo();
		this.getResidentStudents(this.residentId, this.intakeId, this.streamId);
	}

	initSchoolInfo() {
		this.schoolService.schoolInfo.subscribe((school) => {
			this.school = school;
		});
	}

	getResidentStudents(
		residenceId: number,
		intakeId?: number,
		streamId?: number
	) {
		this.printoutService
			.getStudentsByResidence(residenceId, intakeId, streamId)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoading = false))
			)
			.subscribe({
				next: (resp) => {
					this.students = resp;
					if (this.students.students.length == 0) {
						return;
					}
					this.documentTitle = this.students.residence.name;
					this.getListForDisplay();
				},
				error: () => {
					this.isError = true;
				}
			});
	}

	initListDocument(): Promise<PdfMakeWrapper> {
		const documentBody: any[] = [];
		this.students.students.forEach((student) => {
			documentBody.push({
				name: student.studentName || "",
				admno: student.admNo || "",
				kcpe: student.kcpeScore || ""
			});
		});

		return new ClassListPdfDoc(
			this.translate.instant("common.studentHouseList"),
			this.school,
			this.documentHeaders,
			documentBody,
			`${this.translate.instant("students.profile.house")}: ${this.students.residence.name.toString()}`,
			this.students.residence.residenceTeacherName ? `${this.translate.instant("common.supervisor")}: ${this.students.residence.residenceTeacherName}` : "",
		).build();
	}

	getListForDisplay() {
		this.isLoading = true;
		this.initListDocument()
			.then((e) => {
				e.create().getBlob((blob) => {
					const fileReader = new FileReader();
					fileReader.onload = () => {
						this.pdfSrc = new Uint8Array(fileReader.result as ArrayBuffer);
						this.isLoading = false;
					};
					fileReader.readAsArrayBuffer(blob);
					this.isLoading = false;
				});
			})
			.catch((e) => {
				this.isDownloading = false;
				this.isError = true;
			});
	}

	async getListForDownload(action: downloadActions = "download") {
		this.isDownloading = true;
		try {
			const houseList = await this.initListDocument();
			action == "download"
				? houseList.create().download(this.documentTitle)
				: houseList.create().print();
		} catch (e) {
			console.log("unable to download document", e);
		} finally {
			//download complete
			this.isDownloading = false;
		}
	}

	navigateBack() {
		this.navigateBackEvt.emit();
	}
}
