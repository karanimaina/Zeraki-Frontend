import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SchoolDataItem } from "src/app/@core/models/litemore/school/school-data";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-edit-senderid",
	templateUrl: "./edit-senderid.component.html",
	styleUrls: ["./edit-senderid.component.scss"]
})
export class EditSenderidComponent implements OnInit, OnChanges {
	destroys$: Subject<boolean> = new Subject();

	@Input() school?: SchoolDataItem;
	@Input() updateSenderIdModalForm = false;
	@Output() close: EventEmitter<boolean> = new EventEmitter();
	@Output() onSenderIdUpdateSuccess: EventEmitter<string> = new EventEmitter();

	senderIdForm!: SubmitFormGroup;
	testSucceeded = false;
	isSaving = false;
	isTesting = false;

	constructor(
		private litemoreService: LitemoreService,
		private responseHandlerService: ResponseHandlerService,
	) {}

	ngOnInit(): void {
		this.bindForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.senderIdForm?.patchValue({
			senderId: this.school?.senderId,
			phoneNumber: "",
		});
	}

	bindForm() {
		this.senderIdForm = new SubmitFormGroup({
			senderId: new FormControl(this.school?.senderId, [Validators.required]),
			phoneNumber: new FormControl("", [Validators.required])
		});
	}

	get senderId() {
		return this.senderIdForm.get("senderId");
	}

	get phoneNumber() {
		return this.senderIdForm.get("phoneNumber");
	}

	private resetSenderIdForm() {
		this.senderIdForm?.reset();
	}

	addSenderId() {
		const payload = {
			senderId: this.senderId?.value,
			phoneNumber: this.phoneNumber?.value,
			schoolId: this.school?.schoolId
		};
		this.litemoreService.addSenderId(payload).pipe(takeUntil(this.destroys$)).subscribe({
			next: (resp: any) => {
				this.onSenderIdUpdateSuccess.emit(payload.senderId);
				this.resetSenderIdForm();
				this.responseHandlerService.success(resp, "addSenderId()");
			},
			error: err => {
				this.responseHandlerService.error(err, "addSenderId()");
			},
			complete: () => {
				this.closeDialog();
				this.testSucceeded = false;
			}
		});
	}

	closeDialog() {
		this.close.next(true);
	}

	testSenderId() {
		this.testSucceeded = false;
		const payload = {
			senderId: this.senderId?.value,
			phoneNumber: this.phoneNumber?.value
		};
		this.litemoreService.testSenderId(payload).pipe(takeUntil(this.destroys$)).subscribe({
			next: (resp: any) => {
				this.responseHandlerService.success(resp, "testSenderId()");
			},
			error: err => {
				this.responseHandlerService.error(err, "testSenderId()");
			},
			complete: () => {
				this.testSucceeded = true;
			}
		});
	}
}
