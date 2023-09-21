import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {StudentInfo} from "../../../../@core/models/student/student-info";

@Component({
	selector: "tr[app-row]",
	template: `
    <td style="width: 20%;" class="mx-auto">
      <ng-select [items]="_students"
                 dropdownPosition="bottom"
                 style="max-width: 250px"
                 bindLabel="admno"
                 bindValue="userid"
                 [clearable]="false"
                 (ngModelChange)="onStudentChange($event)"
                 [(ngModel)]="selectedStudentId">
      </ng-select>
      <small class="text-danger ms-3" *ngIf="_error && !selectedStudent">
        {{ 'evaluation.manage.noStudentSelected' | translate }}
      </small>
    </td>
    <td style="width: 30%;">
      {{ selectedStudent?.name }}
    </td>
    <td>
      <input type="number"
             *ngIf="selectedStudent"
             [min]="0"
             [max]="_maxMarks"
             class="form-control"
             style="max-width: 100px"
             [(ngModel)]="studentMarks"
             (ngModelChange)="marksUpdated()">
      <small *ngIf="selectedStudent && studentMarks && studentMarks > _maxMarks"
             class="text-danger">
        {{ "evaluation.manage.table.maxValueExceeded" | translate }}
      </small>
      <small *ngIf="selectedStudent && studentMarks && studentMarks < 0"
             class="text-danger">
        {{ "evaluation.manage.table.maxMarksError" | translate }}
      </small>
      <small *ngIf="_error && selectedStudent && !studentMarks"
             class="text-danger">
        {{ "evaluation.manage.table.marksRequired" | translate }}
      </small>
    </td>
    <td>
      <div class="text-center table-action" style="font-size: 20px" (click)="destroyRow()">
        <i  class="fa fa-trash-o text-danger"></i>
      </div>
    </td>`
})
export class NewStudentRowComponent implements OnInit {
	_students: StudentInfo[] = [];
	_maxMarks!: number;
	_error = false;
	studentMarks!: number;
	selectedStudentId!: number;
	selectedStudent!: StudentInfo;

	@Input() set students(students: StudentInfo[]) {
		this._students = students;
	}

	@Input() set maxMarks(maxMarks: number) {
		this._maxMarks = maxMarks;
	}
	@Input() set error(error: boolean) {
		this._error = error;
	}

	@Output() onAddStudent = new EventEmitter<StudentInfo>();
	@Output() onStudentChanged = new EventEmitter<{ previous: StudentInfo, current: StudentInfo }>();
	@Output() onDestroyRow = new EventEmitter<any>();
	constructor() { }

	ngOnInit(): void {
	}

	onStudentChange($event: any) {
		const previousStudent = this._students.find(student => student.userid === this.selectedStudentId);
		this.selectedStudent = this._students.find(student => student.userid === $event)!;

		if (this.selectedStudent) {
			this.selectedStudent.marks = this.studentMarks;
			this.onStudentChanged.emit({previous: previousStudent!, current: this.selectedStudent});
		}
	}

	destroyRow() {
		this.onDestroyRow.emit(this.selectedStudent?.userid);
	}

	marksUpdated() {
		if (this.selectedStudent) {
			this.selectedStudent.marks = this.studentMarks;
			this.onStudentChanged.emit({previous: null!, current: this.selectedStudent});
		}
	}
}
