import * as moment from "moment/moment";
import { TranslateService } from "@ngx-translate/core";

interface NewStudent {
	ADMNO: string;
	INDEXNUMBER: string;
	NAME: string;
	FORM: number;
	STREAM: string;
	GENDER: string;
	DATE_OF_BIRTH: any;
	DOB: any; //Used in updating student profiles
	has_invalid_date: boolean;
	ADMISSION_DATE: any;
	DATE_OF_ADMISSION: any; // Used in updating student profiles
	has_invalid_date_of_adm: boolean;
}

interface InputErrors {
	title: string,
	msg: Array<string>
}
export class NewStudentInputErrors {
	private student: NewStudent = {
		ADMISSION_DATE: undefined,
		DATE_OF_ADMISSION: undefined,
		ADMNO: "",
		INDEXNUMBER: "",
		DATE_OF_BIRTH: undefined,
		DOB: undefined,
		FORM: 0,
		GENDER: "",
		NAME: "",
		STREAM: "",
		has_invalid_date: false,
		has_invalid_date_of_adm: false
	};

	private otherStudents: NewStudent[];
	private selectedIntake: any;
	private translate: TranslateService;

	private readonly studentIndex: number;
	private readonly inputErrors: InputErrors;

	constructor(
		student: NewStudent,
		studentIndex: number,
		otherStudents: NewStudent[],
		translate: TranslateService,
		selectedIntake?: any) {

		this.setStudentValues(student);

		this.otherStudents = otherStudents;
		this.studentIndex = studentIndex;
		this.selectedIntake = selectedIntake;
		this.translate = translate;

		this.inputErrors = {
			title: "",
			msg: []
		};
	}

	setStudentValues(student: NewStudent) {
		this.student.NAME = student.NAME ? student.NAME : "";
		this.student.ADMNO = student.ADMNO ? student.ADMNO.toString() : "";
		this.student.FORM = student.FORM;
		this.student.STREAM = student.STREAM ? student.STREAM.toString().toLowerCase().trim() : "";
		this.student.DATE_OF_BIRTH = student.DATE_OF_BIRTH ? moment(student.DATE_OF_BIRTH, "DD/MM/YYYY") : null;
		this.student.ADMISSION_DATE = student.ADMISSION_DATE ? moment(student.ADMISSION_DATE, "DD/MM/YYYY") : null;
		this.student.DATE_OF_ADMISSION = student.DATE_OF_ADMISSION;
		this.student.INDEXNUMBER = student.INDEXNUMBER;
		this.student.DOB = student.DOB;
		this.student.has_invalid_date = student.has_invalid_date;
		this.student.has_invalid_date_of_adm = student.has_invalid_date_of_adm;
	}

	public setTitle(title) {
		this.inputErrors.title = title;
	}

	public buildErrors() {
		this.blankAdmissionNumber();
		this.admissionNumberHasDuplicates();
		this.blankName();
		this.invalidForm();
		this.blankStream();
		this.invalidStream();
	}

	public buildUpdateProfileErrors() {
		this.blankAdmissionNumber();
		this.admissionNumberHasDuplicates();
		this.indexNumberHasDuplicates();
		this.invalidDate();
		this.invalidDateOfAdmission();
	}

	private blankAdmissionNumber() {
		if (!this.student.ADMNO) {
			const msg = this.translate.instant("students.new.inputErrors.unspecifiedAdmNo");
			this.inputErrors.msg.push(msg);
		}
	}

	private admissionNumberHasDuplicates() {
		this.otherStudents.forEach((stud, index) => {
			if (this.studentIndex != index) {
				if (this.student.ADMNO === stud.ADMNO) {
					const msg = this.translate.instant("students.new.inputErrors.duplicateAdmNo", { student: (index + 1) });
					this.inputErrors.msg.push(msg);
				}
			}
		});
	}

	private indexNumberHasDuplicates() {
		this.otherStudents.forEach((stud, index) => {
			if (this.student.INDEXNUMBER) {
				if (this.studentIndex != index) {
					if (this.student.INDEXNUMBER === stud.INDEXNUMBER) {
						const msg = this.translate.instant("students.new.inputErrors.duplicateIndexNo", { student: (index + 1) });
						this.inputErrors.msg.push(msg);
					}
				}
			}
		});
	}

	private blankName() {
		if (!this.student.NAME) {
			const msg = this.translate.instant("students.new.inputErrors.unspecifiedName");
			this.inputErrors.msg.push(msg);
		}
	}

	private invalidForm() {
		if (this.student.FORM != this.selectedIntake.classlevel) {
			const msg = this.student.FORM
				? this.translate.instant("students.new.inputErrors.invalidForm", { form: this.student.FORM, classLevel: this.selectedIntake.classlevel })
				: this.translate.instant("students.new.inputErrors.unspecifiedForm");

			this.inputErrors.msg.push(msg);
		}
	}

	private blankStream() {
		if (!this.student.STREAM) {
			const msg = this.translate.instant("students.new.inputErrors.unspecifiedStream");
			this.inputErrors.msg.push(msg);
		}
	}

	private invalidStream() {
		if (!this.student.STREAM)
			return;

		const streamExists = this.selectedIntake.streams.some(stream => stream.name.toLowerCase() == this.student.STREAM);

		if (!streamExists) {
			const msg = this.translate.instant("students.new.inputErrors.invalidStream", { stream: this.student.STREAM });
			this.inputErrors.msg.push(msg);
		}
	}

	private invalidDate() {
		if (this.student.has_invalid_date) {
			const msg = this.translate.instant("students.new.inputErrors.invalidDOB", { dob: this.student.DOB });
			this.inputErrors.msg.push(msg);
		}
	}

	private invalidDateOfAdmission() {
		if (this.student.has_invalid_date_of_adm) {
			const msg = this.translate.instant("students.new.inputErrors.invalidDateOfAdmission", { dateOfAdmission: this.student.DATE_OF_ADMISSION });
			this.inputErrors.msg.push(msg);
		}
	}

	public getInputErrors(title: string) {
		this.setTitle(title);
		this.buildErrors();

		return this.inputErrors;
	}

	public getUpdateProfileErrors(title: string) {
		this.setTitle(title);
		this.buildUpdateProfileErrors();

		return this.inputErrors;
	}
}
