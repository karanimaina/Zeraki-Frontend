import {ClassStreams} from "./streams/class-streams";
import {StudentReport} from "./student-report";
import { GradingSystemReport } from "./grading-system-report";

export class ReportForms {
	private _hasCustomComments: boolean;
	private _totalReports: number;
	private _streams: Array<ClassStreams>;
	private _students: Array<StudentReport>;
	private _gradingSystems: Array<GradingSystemReport>;

	constructor() {
		this._hasCustomComments = false;
		this._totalReports = 0;
		this._streams = [];
		this._students = [];
		this._gradingSystems = [];
	}

	public set hasCustomComments(hasCustomComments: boolean) {
		this._hasCustomComments = hasCustomComments;
	}

	public get hasCustomComments(): boolean {
		return this._hasCustomComments;
	}

	public set totalReports(totalReports: number) {
		this._totalReports = totalReports;
	}

	public get totalReports(): number {
		return this._totalReports;
	}

	public set streams(streams: ClassStreams[]) {
		this._streams = streams;
	}

	public get streams(): ClassStreams[] {
		return this._streams;
	}

	public set students(students: StudentReport[]) {
		this._students = students;
	}

	public get students(): StudentReport[] {
		return this._students;
	}

	public set gradingSystems(gradingSystems: GradingSystemReport[]) {
		this._gradingSystems = gradingSystems;
	}

	public get gradingSystems(): GradingSystemReport[] {
		return this._gradingSystems;
	}
}
