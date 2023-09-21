import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import {
	DataService,
	Person
} from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { ZlIntakeMessage } from "../../../@core/models/messages/zl-intake-message";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { SchoolTypes } from "../../../@core/enums/school-types";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { Observable } from "rxjs";
import { FinanceService } from "src/app/@core/services/finance/finance.service";

interface StudentsRecipientsCategories {
	zlCredentials: boolean;
	allStudents: boolean;
	specificStudents: boolean;
	specificClass: boolean;
	examResults: boolean;
	feePayment: boolean;
}

interface TeachersRecipientsCategories {
	all_teachers: boolean;
	spec_teachers: boolean;
	teacher_groups: boolean;
}

interface OfficialsRecipientsCategories {
	all_bom: boolean;
	spec_bom: boolean;
	bom_groups: boolean;
}

interface WorkersRecipientsCategories {
	all_staff: boolean;
	spec_staff: boolean;
	staff_groups: boolean;
}

@Component({
	selector: "app-compose",
	templateUrl: "./compose.component.html",
	styleUrls: ["./compose.component.scss"]
})
export class ComposeComponent implements OnInit {
	schoolTypes = SchoolTypes;
	form_streams: any = { intakes: [] };
	message_categories: any;
	school_sender_profile: any;
	forms_graduated: any[] = [];
	officials: any[] = [];
	teachers: any[] = [];
	workers: any[] = [];
	officials_groups: any[] = [];
	teachers_groups: any[] = [];
	workers_groups: any[] = [];
	teachers_fetched = false;
	officials_fetched = false;
	workers_fetched = false;
	// recipientSelection = 1;
	msg_character_count = 0;
	msg_count = 0;
	specific_details: any = {};
	no_students_found = false;
	no_exams_found = false;
	studentsRecipientsCategories: StudentsRecipientsCategories = {
		zlCredentials: false,
		allStudents: false,
		specificStudents: false,
		specificClass: false,
		examResults: false,
		feePayment: false
	};
	teachersRecipientsCategories: TeachersRecipientsCategories = {
		all_teachers: false,
		spec_teachers: false,
		teacher_groups: false
	};
	officialsRecipientsCategories: OfficialsRecipientsCategories = {
		all_bom: false,
		spec_bom: false,
		bom_groups: false
	};
	workersRecipientsCategories: WorkersRecipientsCategories = {
		all_staff: false,
		spec_staff: false,
		staff_groups: false
	};
	exam_data: any = {};
	getting_exam_data = false;
	send_exam_options: any = {};
	showLoading = false;
	getting_data = false;
	selected_intake_exams: any = [];
	message: any = { phone: [] };
	dataFetching = false;
	msg_count_class = "";
	error_status = false;
	error_msg = "";
	send_message_success: any;
	sendTextMessage = true;
	sendEmail = false;
	sendCriteria = 0;
	optional_msg = "";
	onlySendAdditionalText = false;
	gradesLength = 0;
	schoolTypeData!: SchoolTypeData;

	students_option = true;
	teachers_option = false;
	bom_option = false;
	staff_option = false;
	alumni_option = false;
	others_option = false;

	actStep2 = false;
	actStep3 = false;

	people: Person[] = [];
	peopleBuffer: Person[] = [];
	bufferSize = 10;
	numberOfItemsFromEndBeforeFetchingMore = 5;
	peopleLoading = false;

	selected_recipients = "";
	selected_msgtype = "";
	form_selected = "";
	form_selected_cl = "";
	form_selected_exam = "";

	selectedExam = "";

	allStud_res = true;
	stream_res = false;
	specStud_res = false;
	selected_gradClass = "";

	addOnBlur = true;
	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	loadingZlIntakeMessages = true;
	zlIntakeMessages: ZlIntakeMessage[] = [];
	zlIntakeMessagesForm!: FormGroup;
	zfFeeMessagesForm!: FormGroup;
	allStudentOptions!: {
		boardingStatus: string;
		gender: number;
		residentIds: number[];
	};

	countrySpecificTranslations?: { [key: string]: string };
	stkData$: Observable<any> = this.financeService.getStkData();

	constructor(
		private dataService: DataService,
		private studentsService: StudentsService,
		private messagingService: MessagingService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private formBuilder: FormBuilder,
		private financeService: FinanceService,
		private responseHandler: ResponseHandlerService
	) {}

	ngOnInit(): void {
		this.getFormStreams();
		this.getMessageCategories();
		this.getSchoolProfile();
		this.specific_details.students = [];
		this.specific_details.selected_students = [];
		this.specific_details.intake = {};
		this.specific_details.selected_streams = [];
		this.specific_details.selected_teacherids = [];
		this.specific_details.selected_teachergroupids = [];
		this.specific_details.selected_officialids = [];
		this.specific_details.selected_officialgroupids = [];
		this.specific_details.selected_workerids = [];
		this.specific_details.selected_workergroupids = [];

		this.dataService.schoolData.subscribe((val) => {
			this.schoolTypeData = val;
			this.setCountrySpecificTranslations(val);
		});

		this.initErrors();
		this.initNewMessage();

		this.send_exam_options.streamid = null;
		this.send_exam_options.userid = null;

		if (this.students_option == true) {
			this.translate
				.get("messages.compose.recipients.students")
				.subscribe((translation) => {
					this.selected_recipients = translation;
				});
			this.actStep2 = true;
		}
	}

	private setCountrySpecificTranslations(schoolTypeData: SchoolTypeData) {
		if (schoolTypeData?.isOLevelSchool) {
			this.translate
				.get([
					"common.bog",
					"messages.compose.allBog",
					"messages.compose.specificBog",
					"messages.compose.bogGroups",
					"messages.compose.bogMembers",
					"messages.compose.bogMembersPlaceholder",
					"messages.compose.bogGroupsPlaceholder",
					"messages.compose.toastMessages.unspecifiedBogWarning"
				])
				.subscribe((countrySpecificTranslations) => {
					this.countrySpecificTranslations = {
						"common.bom": countrySpecificTranslations["common.bog"],
						"messages.compose.allBom":
							countrySpecificTranslations["messages.compose.allBog"],
						"messages.compose.specificBom":
							countrySpecificTranslations["messages.compose.specificBog"],
						"messages.compose.bomGroups":
							countrySpecificTranslations["messages.compose.bogGroups"],
						"messages.compose.bomMembers":
							countrySpecificTranslations["messages.compose.bogMembers"],
						"messages.compose.bomMembersPlaceholder":
							countrySpecificTranslations[
								"messages.compose.bogMembersPlaceholder"
							],
						"messages.compose.bomGroupsPlaceholder":
							countrySpecificTranslations[
								"messages.compose.bogGroupsPlaceholder"
							],
						"messages.compose.toastMessages.unspecifiedBomWarning":
							countrySpecificTranslations[
								"messages.compose.toastMessages.unspecifiedBogWarning"
							]
					};
				});
		} else {
			this.translate
				.get([
					"common.bom",
					"messages.compose.allBom",
					"messages.compose.specificBom",
					"messages.compose.bomGroups",
					"messages.compose.bomMembers",
					"messages.compose.bomMembersPlaceholder",
					"messages.compose.bomGroupsPlaceholder",
					"messages.compose.toastMessages.unspecifiedBomWarning"
				])
				.subscribe((countrySpecificTranslations) => {
					this.countrySpecificTranslations = countrySpecificTranslations;
				});
		}
	}

	getFormStreams() {
		this.studentsService.getFormStreams(false, true, true).subscribe((resp) => {
			console.warn("getFormStreams() >>", resp);
			this.form_streams = resp;

			if (
				this.form_streams &&
				this.form_streams?.intakes &&
				this.form_streams?.intakes?.length > 0
			) {
				this.form_streams.intakes.forEach((intake: any) => {
					if (intake?.is_graduated) {
						this.forms_graduated.push(intake);
					}
				});
			}
		});
	}

	getMessageCategories() {
		this.messagingService.getMessageCategories().subscribe((resp) => {
			//  console.warn("getMessageCategories() >> ", resp);
			this.message_categories = resp;
		});
	}

	getSchoolProfile() {
		const params = "?check_sender_id=true";
		this.dataService.getSchoolProfile(params).subscribe((resp) => {
			//  console.warn("getSchoolProfile() >> ", resp);
			this.school_sender_profile = resp;
		});
	}

	getTeachers() {
		this.getting_data = false;
		if (this.teachers?.length == 0) {
			this.getting_data = true;

			this.messagingService.getTeachers().subscribe({
				next: (resp: any) => {
					//  console.warn("getTeachers() >> ", resp);
					this.teachers = resp;

					if (this.teachers != null && this.teachers.length > 0) {
						this.teachers.forEach((teacher) => {
							teacher.selected = false;
						});
					}
				},
				error: (error) => {
					console.error("getTeachers() ERROR >> ", error);
					this.getting_data = false;
					const message = this.translate.instant(
						"common.toastMessages.anErrorOccurred"
					);
					this.toastService.error(message);
				},
				complete: () => {
					this.messagingService.getTeachersGroups().subscribe({
						next: (tgroup: any) => {
							//  console.warn("getTeachersGroups() >> ", tgroup);
							this.teachers_groups = tgroup;
							this.getting_data = false;
							this.teachers_fetched = true;
							if (
								this.teachers_groups != null &&
								this.teachers_groups.length > 0
							) {
								this.teachers_groups.forEach((tg) => {
									tg.selected = false;
								});
							}
						},
						error: (error) => {
							console.error("getTeachersGroups() ERROR >> ", error);
							this.getting_data = false;
							const message = this.translate.instant(
								"common.toastMessages.anErrorOccurred"
							);
							this.toastService.error(message);
						}
					});
				}
			});
		}
	}

	getOfficials() {
		this.getting_data = false;
		if (this.officials.length == 0) {
			this.getting_data = true;

			this.messagingService.getOfficials().subscribe({
				next: (resp: any) => {
					//  console.warn("getOfficials() >> ", resp);
					this.officials = resp ?? [];

					if (this.officials != null && this.officials.length > 0) {
						this.officials.forEach((official) => {
							official.selected = false;
						});
					}
				},
				error: (error) => {
					console.error("getOfficials() ERROR >> ", error);
					this.getting_data = false;
					const message = this.translate.instant(
						"common.toastMessages.anErrorOccurred"
					);
					this.toastService.error(message);
				},
				complete: () => {
					this.messagingService.getOfficialsGroups().subscribe({
						next: (ogroup: any) => {
							//  console.warn("getOfficialsGroups() >> ", ogroup);
							this.officials_groups = ogroup;
							this.getting_data = false;
							this.officials_fetched = true;
							if (
								this.officials_groups != null &&
								this.officials_groups.length > 0
							) {
								this.officials_groups.forEach((og) => {
									og.selected = false;
								});
							}
						},
						error: (error) => {
							console.error("getOfficialsGroups() ERROR >> ", error);
							this.getting_data = false;
							const message = this.translate.instant(
								"common.toastMessages.anErrorOccurred"
							);
							this.toastService.error(message);
						}
					});
				}
			});
		}
	}

	getWorkers() {
		this.getting_data = false;
		if (this.workers.length == 0) {
			this.getting_data = true;

			this.messagingService.getWorkers().subscribe({
				next: (resp: any) => {
					//  console.warn("getWorkers() >> ", resp);
					this.workers = resp;

					if (this.workers != null && this.workers.length > 0) {
						this.workers.forEach((worker) => {
							worker.selected = false;
						});
					}
				},
				error: (error) => {
					console.error("getWorkers() ERROR >> ", error);
					this.getting_data = false;
					const message = this.translate.instant(
						"common.toastMessages.anErrorOccurred"
					);
					this.toastService.error(message);
				},
				complete: () => {
					this.messagingService.getWorkersGroups().subscribe({
						next: (wgroup: any) => {
							//  console.warn("getWorkersGroups() >> ", wgroup);
							this.workers_groups = wgroup;
							this.getting_data = false;
							this.workers_fetched = true;
							if (
								this.workers_groups != null &&
								this.workers_groups.length > 0
							) {
								this.workers_groups.forEach((wg) => {
									wg.selected = false;
								});
							}
						},
						error: (error) => {
							console.error("getWorkersGroups() ERROR >> ", error);
							this.getting_data = false;
							const message = this.translate.instant(
								"common.toastMessages.anErrorOccurred"
							);
							this.toastService.error(message);
						}
					});
				}
			});
		}
	}

	getZlIntakeMessagesSummary() {
		this.messagingService.getZLIntakesMessagesSummary().subscribe({
			next: (resp) => {
				this.loadingZlIntakeMessages = false;
				this.zlIntakeMessages = resp.summary;
				this.initZlIntakeMessagesForm();
			},
			error: (err) => {
				this.loadingZlIntakeMessages = false;
				this.responseHandler.error(err, "getZlIntakeMessagesSummary()");
			}
		});
	}

	initZlIntakeMessagesForm() {
		const zlIntakeMessagesFormArray = this.zlIntakeMessages.map(
			(zlIntakeMessage) => {
				return this.formBuilder.group({
					intakeId: [zlIntakeMessage.intakeId],
					checked: [
						{
							// Temporary fix to disable sending messages to form 4s
							value: zlIntakeMessage.form != 4,
							disabled: zlIntakeMessage.form == 4
						}
					]
				});
			}
		);

		this.zlIntakeMessagesForm = this.formBuilder.group({
			zlIntakeMessages: this.formBuilder.array(zlIntakeMessagesFormArray)
		});
	}

	initZfMessagesForm() {
		const zfMessagesFormArray = this.form_streams.intakes.map((intake) => {
			return this.formBuilder.group({
				intakeId: [intake.intakeid],
				checked: [
					{
						value: true
					}
				]
			});
		});

		this.zfFeeMessagesForm = this.formBuilder.group({
			zfFeeMessages: this.formBuilder.array(zfMessagesFormArray)
		});
	}

	onRecipientsChange() {
		if (!this.alumni_option) {
			this.specific_details = {};
		}
	}

	refreshMessagingState() {
		this.specific_details = {};
		this.selected_intake_exams = [];
		this.initNewMessage();
	}

	updateCharacterCount() {
		if (this.message != null && this.message.text != null) {
			let prefix_count = 0;
			if (!this.school_sender_profile.unique_sender_id) {
				prefix_count =
					"FROM ".length + this.school_sender_profile.name.length + 2;
			}
			this.msg_character_count = this.message.text.length + prefix_count;
			if (this.msg_character_count <= 160) {
				this.msg_count = 1;
			} else if (this.msg_character_count % 160 == 0) {
				this.msg_count = this.msg_character_count / 160;
			} else {
				this.msg_count = this.msg_character_count / 160 + 1;
			}

			if (this.msg_count == 1) {
				this.msg_count_class = "";
			} else if (this.msg_count >= 2) {
				this.msg_count_class = "text-danger2 font-bold";
			}
		}
	}

	fetchIntakeStudents(intakeid: any) {
		this.no_students_found = false;
		if (intakeid != undefined && intakeid != null) {
			this.dataFetching = true;
			this.specific_details.students = [];
			if (
				this.specific_details.selected_students != undefined &&
				this.specific_details.selected_students != null
			) {
				if (this.specific_details.selected_students.length > 0) {
					this.specific_details.selected_students.forEach((student: any) => {
						this.specific_details.students.push(student);
					});
				}
			}

			this.dataService
				.get("groups/intake/students?intakeid=" + intakeid)
				.subscribe((resp: any) => {
					console.warn("fetchIntakeStudents() > ", resp);
					this.specific_details.students = resp.students;
					this.dataFetching = false;
					if (
						this.specific_details.students == undefined ||
						this.specific_details.students == null ||
						this.specific_details.students.length == 0
					) {
						this.no_students_found = true;
					}
				});
		}
	}

	onSelectedStudentsChange_SpecificStudents() {
		console.log(
			"this.specific_details.selected_students",
			this.specific_details.selected_students
		);
	}

	onSelectedFormChange_SpecificClasses() {
		console.log(
			"this.specific_details.intake.streams",
			this.specific_details.intake.streams
		);
		this.specific_details.selected_streams = [];
		if (
			this.specific_details.intake != null &&
			this.specific_details.intake.streams != null
		) {
			this.specific_details.intake.streams.forEach((stream: any) => {
				this.specific_details.selected_streams.push(stream);
			});
		}
	}

	fetchIntakeExams(intakeid: any) {
		this.no_exams_found = false;
		if (intakeid != undefined && intakeid != null) {
			this.dataFetching = true;
			this.selected_intake_exams = [];
			const params = "?intakeid=" + intakeid;

			this.studentsService
				.getStreamIntakeExamData(params, true)
				.subscribe((resp: any) => {
					this.selected_intake_exams = resp.exams.reverse();
					this.dataFetching = false;
					if (
						this.selected_intake_exams == undefined ||
						this.selected_intake_exams == null ||
						this.selected_intake_exams.length == 0
					) {
						this.no_exams_found = true;
					}
				});
		}
	}

	initErrors() {
		this.error_status = false;
		this.error_msg = "";
		this.send_message_success = {};
		this.send_message_success.status = false;
	}

	initNewMessage() {
		this.message = {};
		this.sendTextMessage = true;
		this.sendEmail = false;
		this.exam_data = {};
		this.sendCriteria = 0;
		this.optional_msg = "";
		this.onlySendAdditionalText = false;
		this.gradesLength = 0;
		this.initErrors();
	}

	sendMessage(form: NgForm) {
		this.initErrors();
		if (this.others_option == true) {
			//check if all options are not selected
			if (!this.sendEmail && !this.sendTextMessage) {
				const errorMsg = this.translate.instant(
					"messages.compose.toastMessages.missingPhoneOrEmailWarning"
				);
				this.toastService.warning(errorMsg);
			} else {
				const sms: any = {};
				/*{
				"subject": "Tender Payment",
				"message" : "Come and collect your cheque for the work that you did",
				"sendSms": true,
				"phoneNumbers":["0790673733"],
				"emailAddresses" : ["brian.mbadi@zeraki.co.ke"],
				"sendEmail" :false
			}*/

				sms.subject = this.message.title;
				sms.message = this.message.text;
				sms.sendEmail = this.sendEmail;
				sms.sendSms = this.sendTextMessage;
				// let emailAddresses = $('#tagEditor_email').tagsinput('items');
				// let phoneNumbers = $('#tagEditor_phone').tagsinput('items');
				const emailAddresses = this.message.email;
				const phoneNumbers = this.message.phone;
				//  console.warn("emailAddresses", emailAddresses);
				//  console.warn("phoneNumbers", phoneNumbers);

				if (this.sendEmail && this.sendTextMessage) {
					sms.emailAddresses = emailAddresses;
					sms.phoneNumbers = phoneNumbers;
				} else if (this.sendEmail && !this.sendTextMessage) {
					sms.emailAddresses = emailAddresses;
					sms.phoneNumbers = [];
				} else {
					sms.emailAddresses = [];
					sms.phoneNumbers = phoneNumbers;
				}
				//proceed!
				this.showLoading = true;
				// let base_url = utilityService.getBaseUrl();
				const url = "messages/other";
				this.dataService.send(sms, `${url}`).subscribe({
					next: (response: any) => {
						this.showLoading = false;
						console.log(response.response.message);

						const message = this.translate.instant(
							"messages.compose.toastMessages.messageSentSuccess"
						);
						this.toastService.success(message);

						this.showSuccessMessageCard = true;
						form.resetForm();
					},
					error: (error: HttpErrorResponse) => {
						this.showLoading = false;
						console.error("ERROR >> ", error);

						const message = this.translate.instant(
							"messages.compose.toastMessages.messageSentError"
						);
						this.toastService.error(error.error.response.message);
					}
				});
			}
		} else {
			if (this.message == undefined || this.message == null) {
				this.error_msg = "Please input your message";
				this.error_status = true;
				this.toastService.info(this.error_msg);
			} else if (
				this.message.text == undefined ||
				this.message.text == null ||
				!(this.message.text.trim().length > 0)
			) {
				this.error_msg = "Please input your message";
				this.error_status = true;
				this.toastService.info(this.error_msg);
			} else if (
				this.message.title == undefined ||
				this.message.title == null ||
				!(this.message.title.trim().length > 0)
			) {
				this.error_msg = "Please input the subject";
				this.error_status = true;
				this.toastService.info(this.error_msg);
			} else {
				let proceed = false;
				let url = "";
				let params_sms_email = "";
				if (this.sendTextMessage) {
					params_sms_email += "&phone=true&sms=true";
				}
				if (this.students_option == true || this.alumni_option == true) {
					if (this.sendEmail) {
						params_sms_email += "&email=true";
					}
				}

				if (
					this.students_option == true &&
					this.studentsRecipientsCategories.allStudents
				) {
					proceed = true;
					url = "groups/student/message/form?all_students=true";
				} else if (
					this.students_option == true &&
					this.studentsRecipientsCategories.specificStudents
				) {
					if (
						this.specific_details.selected_students == undefined ||
						this.specific_details.selected_students == null ||
						!(this.specific_details.selected_students.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedStudentsWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						const studentids: any[] = [];
						this.specific_details.selected_students.forEach((student: any) => {
							studentids.push(student.userid);
						});
						url =
							"groups/student/message/form?studentids=" +
							JSON.stringify(studentids);
					}
				} else if (
					this.students_option == true &&
					this.studentsRecipientsCategories.specificClass
				) {
					if (
						this.specific_details.selected_streams == undefined ||
						this.specific_details.selected_streams == null ||
						!(this.specific_details.selected_streams.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedClassesWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						const streamids: any[] = [];
						this.specific_details.selected_streams.forEach((stream: any) => {
							streamids.push(stream.streamid);
						});
						url =
							"groups/student/message/form?streamids=" +
							JSON.stringify(streamids);
					}
				} else if (
					this.teachers_option == true &&
					this.teachersRecipientsCategories.all_teachers
				) {
					proceed = true;
					url = "groups/school/message?teachers=true";
				} else if (
					this.teachers_option == true &&
					this.teachersRecipientsCategories.spec_teachers
				) {
					if (
						this.specific_details.selected_teacherids == undefined ||
						this.specific_details.selected_teacherids == null ||
						!(this.specific_details.selected_teacherids.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedTeachersWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/school/message?users=" +
							JSON.stringify(this.specific_details.selected_teacherids);
					}
				} else if (
					this.teachers_option == true &&
					this.teachersRecipientsCategories.teacher_groups
				) {
					if (
						this.specific_details.selected_teachergroupids == undefined ||
						this.specific_details.selected_teachergroupids == null ||
						!(this.specific_details.selected_teachergroupids.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedTeacherGroupsWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/school/message?teachers=true&teachers_groups=" +
							JSON.stringify(this.specific_details.selected_teachergroupids);
					}
				} else if (
					this.bom_option == true &&
					this.officialsRecipientsCategories.all_bom
				) {
					proceed = true;
					url = "groups/school/message?officials=true";
				} else if (
					this.bom_option == true &&
					this.officialsRecipientsCategories.spec_bom
				) {
					if (
						this.specific_details.selected_officialids == undefined ||
						this.specific_details.selected_officialids == null ||
						!(this.specific_details.selected_officialids.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedOfficialsWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/school/message?users=" +
							JSON.stringify(this.specific_details.selected_officialids);
					}
				} else if (
					this.bom_option == true &&
					this.officialsRecipientsCategories.bom_groups
				) {
					if (
						this.specific_details.selected_officialgroupids == undefined ||
						this.specific_details.selected_officialgroupids == null ||
						!(this.specific_details.selected_officialgroupids.length > 0)
					) {
						const errorMsg =
							this.countrySpecificTranslations?.[
								"messages.compose.toastMessages.unspecifiedBomWarning"
							];
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/school/message?officials=true&officials_groups=" +
							JSON.stringify(this.specific_details.selected_officialgroupids);
					}
				} else if (this.alumni_option == true) {
					if (
						this.specific_details.graduated_intake == undefined ||
						this.specific_details.graduated_intake == null ||
						this.specific_details.graduated_intake.intakeid == null
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedGraduatedClassWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/student/message/form?intakeid=" +
							this.specific_details.graduated_intake.intakeid;
					}
				} else if (
					this.staff_option == true &&
					this.workersRecipientsCategories.all_staff
				) {
					proceed = true;
					url = "groups/school/message?workers=true";
				} else if (
					this.staff_option == true &&
					this.workersRecipientsCategories.spec_staff
				) {
					if (
						this.specific_details.selected_workerids == undefined ||
						this.specific_details.selected_workerids == null ||
						!(this.specific_details.selected_workerids.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedOfficialsWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/school/message?users=" +
							JSON.stringify(this.specific_details.selected_workerids);
					}
				} else if (
					this.staff_option == true &&
					this.workersRecipientsCategories.staff_groups
				) {
					if (
						this.specific_details.selected_workergroupids == undefined ||
						this.specific_details.selected_workergroupids == null ||
						!(this.specific_details.selected_workergroupids.length > 0)
					) {
						const errorMsg = this.translate.instant(
							"messages.compose.toastMessages.unspecifiedStaffGroupsWarning"
						);
						this.toastService.warning(errorMsg);
					} else {
						proceed = true;
						url =
							"groups/school/message?workers=true&workers_groups=" +
							JSON.stringify(this.specific_details.selected_workergroupids);
					}
				}

				url += params_sms_email;

				if (!this.error_status && proceed) {
					Swal.fire({
						title: this.translate.instant("messages.compose.swal.title"),
						text: this.translate.instant("messages.compose.swal.text"),
						icon: "question",
						showCancelButton: true,
						confirmButtonColor: "#43ab49",
						cancelButtonColor: "#ff562f",
						confirmButtonText: this.translate.instant(
							"common.swal.confirmButtonTextYes"
						)
					}).then((result) => {
						if (result.isConfirmed) {
							const hasMessagePayload = url.includes(
								"groups/student/message/form"
							);

							let messagePayload = {
								message: this.message
							};

							if (
								this.studentsRecipientsCategories.allStudents &&
								this.allStudentOptions
							) {
								messagePayload = {
									...messagePayload,
									...this.allStudentOptions
								};
							}

							this.showLoading = true;
							this.dataService
								.send(hasMessagePayload ? messagePayload : this.message, url)
								.subscribe({
									next: (data: any) => {
										//  console.warn("DATA >> ", data);
										this.send_message_success.status = true;
										this.showLoading = false;

										console.log(data.message);

										const message = this.translate.instant(
											"messages.compose.toastMessages.messageSentSuccess"
										);
										this.toastService.success(message);

										this.showSuccessMessageCard = true;
										form.resetForm();
									},
									error: (err) => {
										// this.errorMessage = error.message;
										console.error("There was an error!", err);
										this.showLoading = false;
										const errorMsg = this.translate.instant(
											"common.toastMessages.anErrorOccurred"
										);
										let error_msg = errorMsg;
										// let error_msg = "An error occurred";
										if (err.error.message !== undefined) {
											error_msg = err.error.message;
										}
										this.toastService.error(error_msg);
									},
									complete: () => {
										this.refreshMessagingState(); //Takes care of the back button
									}
								});
						}
					});
				}
			}
		}
	}

	sendZerakiLearningCredentials() {
		this.initErrors();

		const intakes = this.zlIntakeMessagesFormArray.getRawValue();
		const selectedIntakeIds = intakes
			.filter((intake) => intake.checked)
			.map((intake) => intake.intakeId);

		if (selectedIntakeIds.length === 0) {
			this.toastService.warning(
				this.translate.instant(
					"messages.compose.toastMessages.unspecifiedZLIntakesWarning"
				)
			);
			return;
		}

		Swal.fire({
			title: this.translate.instant("messages.compose.swal.title2"),
			text: this.translate.instant("messages.compose.swal.text2"),
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextYes"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				this.showLoading = true;
				const url =
					"groups/student/message/form?lda=true&intakeids=" +
					JSON.stringify(selectedIntakeIds);

				const messagePayload = {
					message: this.message
				};

				this.dataService.send(messagePayload, url).subscribe({
					next: (data) => {
						//  console.warn("DATA >> ", data);
						this.send_message_success.status = true;
						this.showLoading = false;
						const message = this.translate.instant(
							"messages.compose.toastMessages.messageSentSuccess"
						);
						this.toastService.success(message);
						this.showSuccessMessageCard = true;
					},
					error: (error) => {
						// this.errorMessage = error.message;
						console.error("There was an error!", error);
						this.showLoading = false;
						this.error_msg = "An error occurred";
						if (error.message !== undefined) {
							this.error_msg = error.message;
						}
						this.error_status = true;
					}
				});
			}
		});
	}

	sendZerakiFinanceFeeMessages() {
		this.initErrors();

		const intakes = this.zfFeeMessagesFormArray.getRawValue();

		const selectedIntakeIds = intakes
			.filter((intake) => intake.checked)
			.map((intake) => intake.intakeId);

		if (selectedIntakeIds.length === 0) {
			this.toastService.warning(
				this.translate.instant(
					"messages.compose.toastMessages.unspecifiedZFIntakesWarning"
				)
			);
			return;
		}

		Swal.fire({
			title: this.translate.instant("messages.compose.swal.finance.title"),
			text: this.translate.instant("messages.compose.swal.finance.text"),
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextYes"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				this.showLoading = true;
				const url =
					"groups/student/message/form?finance=true&intakeids=" +
					JSON.stringify(selectedIntakeIds);

				const messagePayload = {
					message: this.message
				};

				this.dataService.send(messagePayload, url).subscribe({
					next: (data) => {
						//  console.warn("DATA >> ", data);
						this.send_message_success.status = true;
						this.showLoading = false;
						const message = this.translate.instant(
							"messages.compose.toastMessages.messageSentSuccess"
						);
						this.toastService.success(message);
						this.showSuccessMessageCard = true;
					},
					error: (error) => {
						this.showLoading = false;
						this.responseHandler.error(error, "sendZerakiFinanceFeeMessages()");
					}
				});
			}
		});
	}

	private get zlIntakeMessagesFormArray(): FormArray {
		return this.zlIntakeMessagesForm.get("zlIntakeMessages") as FormArray;
	}

	private get zfFeeMessagesFormArray(): FormArray {
		return this.zfFeeMessagesForm.get("zfFeeMessages") as FormArray;
	}

	isFetchingGrades = false;
	onSelectedExamChange() {
		this.isFetchingGrades = true;
		if (
			this.specific_details.intake != null &&
			this.specific_details.intake.intakeid != null &&
			this.specific_details.intake.intakeid > 0
		) {
			let proceed = false;
			let params = "";
			if (
				this.specific_details.selected_exam != undefined &&
				this.specific_details.selected_exam != null &&
				this.specific_details.selected_exam.name != null
			) {
				params = "?intakeid=" + this.specific_details.intake.intakeid;
				if (
					this.specific_details.selected_exam.seriesid != null &&
					this.specific_details.selected_exam.seriesid > 0
				) {
					params += "&seriesid=" + this.specific_details.selected_exam.seriesid;
					proceed = true;
				} else if (
					this.specific_details.selected_exam.egroupid != null &&
					this.specific_details.selected_exam.egroupid > 0
				) {
					params += "&egroupid=" + this.specific_details.selected_exam.egroupid;
					proceed = true;
				} else if (
					this.specific_details.selected_exam.annualEgroupid != null &&
					this.specific_details.selected_exam.annualEgroupid > 0
				) {
					params +=
						"&annualEgroupid=" +
						this.specific_details.selected_exam.annualEgroupid;
					proceed = true;
				}
			}

			if (proceed) {
				this.initNewMessage();
				this.getting_exam_data = true;
				this.messagingService.getExamStudentsAndStreams(params).subscribe({
					next: (resp) => {
						//  console.warn("Resp >> ", resp);
						this.exam_data = resp;

						this.initializeGradesBasedOnSchoolType();

						this.getting_exam_data = false;
						this.isFetchingGrades = false;
					},
					error: (error) => {
						console.error("ERROR >> ", error);
						this.getting_exam_data = false;

						this.toastService.error(error.message);
						this.isFetchingGrades = false;
					}
				});
			}
		}
	}

	initializeGradesBasedOnSchoolType() {
		const grades = this.exam_data.grades || [];
		const mentions = this.exam_data.mentions || [];

		const formatMentions =
			this.schoolTypeData?.isGuineaSchool ||
			this.schoolTypeData?.isIvorianSchool;
		if (formatMentions) {
			mentions.forEach((mention) => {
				mention.selected = true;
			});
			this.gradesLength = mentions.length;
		} else {
			grades.forEach((g: any) => {
				g.selected = true;
			});
			this.gradesLength = grades.length;
		}
	}

	sendResults() {
		this.initErrors();
		if (this.optional_msg == null) {
			this.optional_msg = "";
		}
		this.optional_msg = this.optional_msg.trim();
		const url = "analytics/sms/results";
		let params = "?optional_msg_only=" + this.onlySendAdditionalText;
		if (this.exam_data.seriesid) {
			params += "&seriesid=" + this.exam_data.seriesid;
		} else if (this.exam_data.egroupid) {
			params += "&egroupid=" + this.exam_data.egroupid;
		} else if (this.exam_data.annualEgroupid) {
			params += "&annualEgroupid=" + this.exam_data.annualEgroupid;
		}

		params += "&current_intakeid=" + this.exam_data.intakeid;
		if (this.allStud_res) {
			params += "&intakeid=" + this.exam_data.intakeid;
		} else if (this.stream_res) {
			params += "&streamid=" + this.send_exam_options.streamid;
		} else if (this.specStud_res) {
			params += "&userid=" + this.send_exam_options.userid;
		}

		if (this.onlySendAdditionalText && this.optional_msg.length == 0) {
			this.error_msg = this.translate.instant(
				"messages.compose.specifyOptMessage"
			);
			this.error_status = true;
		}

		const paramOptions: any = { optional_msg: this.optional_msg, grades: [] };
		if ((this.allStud_res || this.stream_res) && this.gradesLength > 0) {
			const selectedGrades: any[] = this.getSelectedGradesBasedOnSchoolType();

			if (selectedGrades.length == 0) {
				this.error_msg = this.translate.instant(
					"messages.compose.specifyGrade"
				);
				this.error_status = true;
			} else {
				const setMentions =
					this.schoolTypeData.isGuineaSchool ||
					this.schoolTypeData?.isIvorianSchool;
				if (setMentions) {
					paramOptions.mentions = selectedGrades;
				} else {
					paramOptions.grades = selectedGrades;
				}
			}
		}

		if (!this.error_status) {
			Swal.fire({
				title: this.translate.instant("messages.compose.swal.title3"),
				text: this.translate.instant("messages.compose.swal.text3"),
				icon: "question",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant(
					"common.swal.confirmButtonTextYes"
				)
			}).then((result) => {
				if (result.isConfirmed) {
					this.showLoading = true;
					this.dataService.send(paramOptions, url + params).subscribe({
						next: (data) => {
							//  console.warn("DATA >> ", data);
							this.send_message_success.status = true;
							this.showLoading = false;
							const message = this.translate.instant(
								"messages.compose.toastMessages.messageSentSuccess"
							);
							this.toastService.success(message);
							this.showSuccessMessageCard = true;
						},
						error: (error) => {
							// this.errorMessage = error.message;
							console.error("There was an error!", error);
							const errorMsg = this.translate.instant(
								"common.toastMessages.anErrorOccurred"
							);
							this.error_msg = errorMsg;
							// this.error_msg = "An unexpected error occurred";
							if (error.message !== undefined) {
								this.error_msg = error.error.message;
							}
							this.toastService.error(this.error_msg);
							this.error_status = true;
							this.showLoading = false;
						}
					});
				}
			});
		}
	}

	getSelectedGradesBasedOnSchoolType() {
		const selectedGrades: any[] = [];
		const useMentions =
			this.schoolTypeData?.isGuineaSchool ||
			this.schoolTypeData?.isIvorianSchool;
		if (useMentions) {
			this.exam_data.mentions.forEach((examMention: any) => {
				if (examMention.selected) {
					selectedGrades.push(examMention.mention);
				}
			});
		} else {
			this.exam_data.grades.forEach((examGrade: any) => {
				if (examGrade.selected) {
					selectedGrades.push(examGrade.grade);
				}
			});
		}

		return selectedGrades;
	}

	customSearchFn(term: string, item: any) {
		// console.warn("term, item >>", term, item);
		term = term.toLowerCase();
		return (
			item.name.toLowerCase().indexOf(term) > -1 ||
			item?.admno?.toLowerCase() === term
		);
	}

	onScrollToEnd() {
		this.fetchMore();
	}

	onScroll(end: any) {
		if (this.peopleLoading || this.people.length <= this.peopleBuffer.length) {
			return;
		}

		if (
			end + this.numberOfItemsFromEndBeforeFetchingMore >=
			this.peopleBuffer.length
		) {
			this.fetchMore();
		}
	}

	private fetchMore() {
		const len = this.peopleBuffer.length;
		const more = this.people.slice(len, this.bufferSize + len);
		this.peopleLoading = true;
		// using timeout here to simulate backend API delay
		setTimeout(() => {
			this.peopleLoading = false;
			this.peopleBuffer = this.peopleBuffer.concat(more);
		}, 200);
	}

	toggleResultsTo(option: string) {
		//  console.warn("Exam res >> ", option);
		switch (option) {
			case "allStud_res":
				this.allStud_res = true;
				this.stream_res = false;
				this.specStud_res = false;
				break;
			case "stream_res":
				this.allStud_res = false;
				this.stream_res = true;
				this.specStud_res = false;
				break;
			case "specStud_res":
				this.allStud_res = false;
				this.stream_res = false;
				this.specStud_res = true;
				break;
			default:
				this.allStud_res = false;
				this.stream_res = false;
				this.specStud_res = true;
				break;
		}
	}

	toggleRecipient(option: string) {
		this.onRecipientsChange(); // RELOADING THE PAGE COULD DO THE TRICK
		//  console.warn("Rec", option);
		this.actStep3 = false;
		switch (option) {
			case "students":
				this.students_option = true;
				this.teachers_option = false;
				this.bom_option = false;
				this.staff_option = false;
				this.alumni_option = false;
				this.others_option = false;
				this.selected_recipients = this.translate.instant(
					"messages.compose.recipients.students"
				);
				this.selected_msgtype = "";
				break;
			case "teachers":
				this.getTeachers();
				this.students_option = false;
				this.teachers_option = true;
				this.bom_option = false;
				this.staff_option = false;
				this.alumni_option = false;
				this.others_option = false;
				this.selected_recipients = this.translate.instant(
					"messages.compose.recipients.teachers"
				);
				this.selected_msgtype = "";
				break;
			case "bom":
				this.getOfficials();
				this.students_option = false;
				this.teachers_option = false;
				this.bom_option = true;
				this.staff_option = false;
				this.alumni_option = false;
				this.others_option = false;
				this.selected_recipients = this.countrySpecificTranslations
					? this.countrySpecificTranslations?.["common.bom"]
					: "";
				this.selected_msgtype = "";
				break;
			case "staff":
				this.getWorkers();
				this.students_option = false;
				this.teachers_option = false;
				this.bom_option = false;
				this.staff_option = true;
				this.alumni_option = false;
				this.others_option = false;
				this.selected_recipients = this.translate.instant(
					"messages.compose.recipients.staff"
				);
				this.selected_msgtype = "";
				break;
			case "alumni":
				this.students_option = false;
				this.teachers_option = false;
				this.bom_option = false;
				this.staff_option = false;
				this.alumni_option = true;
				this.others_option = false;
				this.selected_recipients = this.translate.instant(
					"messages.compose.recipients.alumni"
				);
				this.selected_msgtype = "";
				break;
			case "others":
				this.students_option = false;
				this.teachers_option = false;
				this.bom_option = false;
				this.staff_option = false;
				this.alumni_option = false;
				this.others_option = true;
				this.selected_recipients = this.translate.instant(
					"messages.compose.recipients.others"
				);
				this.selected_msgtype = "";
				break;
			default:
				this.students_option = false;
				this.teachers_option = false;
				this.bom_option = false;
				this.staff_option = false;
				this.alumni_option = false;
				this.others_option = false;
				this.selected_recipients = "";
				this.selected_msgtype = "";
				break;
		}

		if (
			this.students_option ||
			this.teachers_option ||
			this.bom_option ||
			this.staff_option ||
			this.alumni_option
		) {
			this.actStep2 = true;
		} else this.actStep2 = false;
	}

	toggleMsgType(option: string, event: any) {
		//  console.warn(option, " >> ", event);
		this.onRecipientsChange();
		switch (option) {
			// Students stuff actStep2

			case "learn_cred":
				if (event == true) {
					this.studentsRecipientsCategories.zlCredentials = true;
					this.studentsRecipientsCategories.allStudents = false;
					this.studentsRecipientsCategories.specificStudents = false;
					this.studentsRecipientsCategories.specificClass = false;
					this.studentsRecipientsCategories.examResults = false;
					this.studentsRecipientsCategories.feePayment = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.sendCredentials"
					);
					this.getZlIntakeMessagesSummary();
				} else {
					this.studentsRecipientsCategories.zlCredentials = false;
					this.selected_msgtype = "";
				}
				break;
			case "fee_payment":
				if (event == true) {
					this.studentsRecipientsCategories.zlCredentials = false;
					this.studentsRecipientsCategories.allStudents = false;
					this.studentsRecipientsCategories.specificStudents = false;
					this.studentsRecipientsCategories.specificClass = false;
					this.studentsRecipientsCategories.examResults = false;
					this.studentsRecipientsCategories.feePayment = true;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.sendFeePayment"
					);
					this.initZfMessagesForm();
				} else {
					this.studentsRecipientsCategories.feePayment = false;
					this.selected_msgtype = "";
				}
				break;
			case "all_students":
				if (event == true) {
					this.studentsRecipientsCategories.zlCredentials = false;
					this.studentsRecipientsCategories.allStudents = true;
					this.studentsRecipientsCategories.specificStudents = false;
					this.studentsRecipientsCategories.specificClass = false;
					this.studentsRecipientsCategories.examResults = false;
					this.studentsRecipientsCategories.feePayment = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.allStudents"
					);
				} else {
					this.studentsRecipientsCategories.allStudents = false;
					this.selected_msgtype = "";
				}
				break;
			case "spec_stud":
				if (event == true) {
					this.studentsRecipientsCategories.zlCredentials = false;
					this.studentsRecipientsCategories.allStudents = false;
					this.studentsRecipientsCategories.specificStudents = true;
					this.studentsRecipientsCategories.specificClass = false;
					this.studentsRecipientsCategories.examResults = false;
					this.studentsRecipientsCategories.feePayment = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.specificStudents"
					);
				} else {
					this.studentsRecipientsCategories.specificStudents = false;
					this.selected_msgtype = "";
				}
				break;
			case "spec_class":
				if (event == true) {
					this.studentsRecipientsCategories.zlCredentials = false;
					this.studentsRecipientsCategories.allStudents = false;
					this.studentsRecipientsCategories.specificStudents = false;
					this.studentsRecipientsCategories.specificClass = true;
					this.studentsRecipientsCategories.examResults = false;
					this.studentsRecipientsCategories.feePayment = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.specificClasses"
					);
				} else {
					this.studentsRecipientsCategories.specificClass = false;
					this.selected_msgtype = "";
				}
				break;
			case "exam_res":
				if (event == true) {
					this.studentsRecipientsCategories.zlCredentials = false;
					this.studentsRecipientsCategories.allStudents = false;
					this.studentsRecipientsCategories.specificStudents = false;
					this.studentsRecipientsCategories.specificClass = false;
					this.studentsRecipientsCategories.examResults = true;
					this.studentsRecipientsCategories.feePayment = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.examResults"
					);
				} else {
					this.studentsRecipientsCategories.examResults = false;
					this.selected_msgtype = "";
				}
				break;

			// Teachers stuff actStep2
			case "all_teachers":
				if (event == true) {
					this.teachersRecipientsCategories.all_teachers = true;
					this.teachersRecipientsCategories.spec_teachers = false;
					this.teachersRecipientsCategories.teacher_groups = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.allTeachers"
					);
				} else {
					this.teachersRecipientsCategories.all_teachers = false;
					this.selected_msgtype = "";
				}
				break;
			case "spec_teachers":
				if (event == true) {
					this.teachersRecipientsCategories.all_teachers = false;
					this.teachersRecipientsCategories.spec_teachers = true;
					this.teachersRecipientsCategories.teacher_groups = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.specificTeachers"
					);
				} else {
					this.teachersRecipientsCategories.spec_teachers = false;
					this.selected_msgtype = "";
				}
				break;
			case "teacher_groups":
				if (event == true) {
					this.teachersRecipientsCategories.all_teachers = false;
					this.teachersRecipientsCategories.spec_teachers = false;
					this.teachersRecipientsCategories.teacher_groups = true;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.teacherGroups"
					);
				} else {
					this.teachersRecipientsCategories.teacher_groups = false;
					this.selected_msgtype = "";
				}
				break;

			// BOM/PA stuff actStep2
			case "all_bom":
				if (event == true) {
					this.officialsRecipientsCategories.all_bom = true;
					this.officialsRecipientsCategories.spec_bom = false;
					this.officialsRecipientsCategories.bom_groups = false;
					this.selected_msgtype =
						this.countrySpecificTranslations?.["messages.compose.allBom"] || "";
				} else {
					this.officialsRecipientsCategories.all_bom = false;
					this.selected_msgtype = "";
				}
				break;
			case "spec_bom":
				if (event == true) {
					this.officialsRecipientsCategories.all_bom = false;
					this.officialsRecipientsCategories.spec_bom = true;
					this.officialsRecipientsCategories.bom_groups = false;
					this.selected_msgtype =
						this.countrySpecificTranslations?.[
							"messages.compose.specificBom"
						] || "";
				} else {
					this.officialsRecipientsCategories.spec_bom = false;
					this.selected_msgtype = "";
				}
				break;
			case "bom_groups":
				if (event == true) {
					this.officialsRecipientsCategories.all_bom = false;
					this.officialsRecipientsCategories.spec_bom = false;
					this.officialsRecipientsCategories.bom_groups = true;
					this.selected_msgtype =
						this.countrySpecificTranslations?.["messages.compose.bomGroups"] ||
						"";
				} else {
					this.officialsRecipientsCategories.bom_groups = false;
					this.selected_msgtype = "";
				}
				break;

			// BOM/PA stuff actStep2
			case "all_staff":
				if (event == true) {
					this.workersRecipientsCategories.all_staff = true;
					this.workersRecipientsCategories.spec_staff = false;
					this.workersRecipientsCategories.staff_groups = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.allStaff"
					);
				} else {
					this.workersRecipientsCategories.all_staff = false;
					this.selected_msgtype = "";
				}
				break;
			case "spec_staff":
				if (event == true) {
					this.workersRecipientsCategories.all_staff = false;
					this.workersRecipientsCategories.spec_staff = true;
					this.workersRecipientsCategories.staff_groups = false;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.specificStaff"
					);
				} else {
					this.workersRecipientsCategories.spec_staff = false;
					this.selected_msgtype = "";
				}
				break;
			case "staff_groups":
				if (event == true) {
					this.workersRecipientsCategories.all_staff = false;
					this.workersRecipientsCategories.spec_staff = false;
					this.workersRecipientsCategories.staff_groups = true;
					this.selected_msgtype = this.translate.instant(
						"messages.compose.staffGroups"
					);
				} else {
					this.workersRecipientsCategories.staff_groups = false;
					this.selected_msgtype = "";
				}
				break;

			// Alumni stuff actStep2
			case "grad_class":
				this.selected_msgtype = event.label;
				break;

			default:
				// Students stuff
				this.studentsRecipientsCategories.zlCredentials = false;
				this.studentsRecipientsCategories.allStudents = false;
				this.studentsRecipientsCategories.specificStudents = false;
				this.studentsRecipientsCategories.specificClass = false;
				this.studentsRecipientsCategories.examResults = false;
				this.studentsRecipientsCategories.feePayment = false;
				this.selected_msgtype = "";

				// Teachers stuff
				this.teachersRecipientsCategories.all_teachers = false;
				this.teachersRecipientsCategories.spec_teachers = false;
				this.teachersRecipientsCategories.teacher_groups = false;

				// BOM/PA stuff
				this.officialsRecipientsCategories.all_bom = false;
				this.officialsRecipientsCategories.spec_bom = false;
				this.officialsRecipientsCategories.bom_groups = false;

				// Staff stuff
				this.workersRecipientsCategories.all_staff = false;
				this.workersRecipientsCategories.spec_staff = false;
				this.workersRecipientsCategories.staff_groups = false;
				break;
		}
		if (
			this.studentsRecipientsCategories.zlCredentials ||
			this.studentsRecipientsCategories.allStudents ||
			this.studentsRecipientsCategories.specificStudents ||
			this.studentsRecipientsCategories.specificClass ||
			this.studentsRecipientsCategories.examResults ||
			this.studentsRecipientsCategories.feePayment
		) {
			this.actStep3 = true;
		} else this.actStep3 = false;
	}

	// next() {
	//   this.stepper.next();
	// }

	/**
	 * Add phone number to chip list
	 * @param event Chip event when sending message to others.
	 */
	phoneNumbers: any[] = [];
	addPhone(event: MatChipInputEvent): void {
		const value = (event.value || "").trim();

		// // Regex Kenyan validator
		// const phoneno = /^0(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/;
		// const phoneno2 = /^0(1(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/;
		// if (!value.match(phoneno) && !value.match(phoneno2)) {
		// 	this.toastService.error("Invalid phone number");
		// }

		// Add the phone number
		if (value) {
			this.phoneNumbers.push(value);
			this.message.phone = [...this.phoneNumbers];
		}

		// Clear the input value
		event.chipInput!.clear();
	}

	removePhone(phone: any): void {
		const index = this.message.phone.indexOf(phone);

		if (index >= 0) {
			this.phoneNumbers.splice(index, 1);
			this.message.phone = [...this.phoneNumbers];
		}
	}

	/**
	 * Add email to chip list
	 * @param event Chip event when sending message to others.
	 */
	emails: any[] = [];
	addEmail(event: MatChipInputEvent): void {
		const value = (event.value || "").trim();

		// Add our fruit
		if (value) {
			this.emails.push(value);
			this.message.email = [...this.emails];
		}

		// Clear the input value
		event.chipInput!.clear();
	}

	removeEmail(email: any): void {
		const index = this.message.email.indexOf(email);

		if (index >= 0) {
			this.emails.splice(index, 1);
			this.message.email = [...this.emails];
		}
	}

	showSuccessMessageCard = false;
	closeSuccessMessageCard() {
		this.showSuccessMessageCard = !this.showSuccessMessageCard;
		this.ngOnInit();
	}

	updateAllStudentsOptions($event: any) {
		this.allStudentOptions = $event;
	}
}
