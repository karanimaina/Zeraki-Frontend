import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, LOCALE_ID, ViewEncapsulation } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MatCalendar } from "@angular/material/datepicker";
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from "@fullcalendar/angular";
import enLocale from "@fullcalendar/core/locales/en-gb";
import frLocale from "@fullcalendar/core/locales/fr";
import { HotToastService } from "@ngneat/hot-toast";
import { EventSession, SchoolEvent } from "src/app/@core/models/school-event";
import { createEventId } from "./event-utils";
import { BASE_OPTION_REFINERS } from "@fullcalendar/core";
(BASE_OPTION_REFINERS as any).schedulerLicenseKey = String;
import { Role } from "../../../@core/models/Role";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { TranslateService } from "@ngx-translate/core";
import { FullCalendarLocaleService } from "src/app/@core/shared/services/fullcalendar-locale-additions.service";
import { Subscription } from "rxjs";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import {
	MAT_MOMENT_DATE_FORMATS,
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import "../../../@core/constants/moment-js-locale-additions/rw";
import "../../../@core/constants/moment-js-locale-additions/am";
import "moment/locale/fr";
import "moment/locale/sw";
import "moment/locale/en-gb";
import { DateTimeAdapter, OwlDateTimeIntl } from "@danielmoncada/angular-datetime-picker";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { Location } from "@angular/common";
import { EventsService } from "src/app/@core/services/events/events.service";
import { TeacherService } from "src/app/@core/services/teacher/teacher.service";


@Component({
	selector: "app-manage-events",
	templateUrl: "./manage-events.component.html",
	styleUrls: ["./manage-events.component.scss"],
	encapsulation: ViewEncapsulation.None,
	providers: [
		{ provide: MAT_DATE_LOCALE, useValue: "en-gb" },
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
	],
})
export class ManageEventsComponent implements OnInit, OnDestroy {
	userRoles!: Role;
	selected?: Date | null;
	single_option = true;
	range_option = false;
	eventsObj: any;
	editEv: SchoolEvent = new SchoolEvent();
	editEventSession: EventSession = new EventSession();
	dialog: any;
	evSession: any;
	sess_single_option = true;
	sess_range_option = false;
	dateSet = false;
	@ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
	todayDate = new Date();
	teacherGroups: any[] = [];
	addEditEvent = false;
	@ViewChild("closeEventModal") closeEventModal?: ElementRef;
	@ViewChild("closeViewEv") closeViewEv?: ElementRef;
	@ViewChild("editEvHidden") editEvHidden?: ElementRef;
	@ViewChild("viewEditEvHidden") viewEditEvHidden?: ElementRef;
	schoolTypeData?: SchoolTypeData;

	constructor(
		private location: Location,
		private eventsService: EventsService,
		private teacherService: TeacherService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private siteLanguageService: SiteLanguageService,
		private fullCalendarLocaleService: FullCalendarLocaleService,
		private rolesService: RolesService,
		private owlDateTimeIntl: OwlDateTimeIntl,
		private dateTimeAdapter: DateTimeAdapter<any>,
		private _adapter: DateAdapter<any>,
		private dataService: DataService,
		@Inject(MAT_DATE_LOCALE) private _locale: string,
		@Inject(LOCALE_ID) public locale: string
	) {
		// when location change...
		this.location.subscribe(location => {
			// ...close popup
			this.closeEventModal?.nativeElement.click();
			this.closeViewEv?.nativeElement.click();
		});

		this.rolesService.roleSubject.subscribe((role: Role) => {
			this.userRoles = role;
			if (role && role.isSchoolAdmin) {
				this.getTeacherGroups();
			}
		});
	}

	calendarVisible = true;
	calendarOptions: CalendarOptions = {
		locales: [enLocale, frLocale],
		height: 500,
		contentHeight: 400,
		aspectRatio: 0.25,
		themeSystem: "bootstrap",
		schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
		headerToolbar: {
			left: "prev,next today",
			center: "title",
			right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
		},
		initialView: "dayGridMonth",
		// initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
		weekends: true,
		editable: false,
		selectable: true,
		// selectMirror: true,
		dayMaxEvents: 3,
		showNonCurrentDates: false,
		eventColor: "#ffffff00",
		eventTimeFormat: {
			hour: "numeric",
			minute: "2-digit",
			meridiem: "short"
		},
		eventDisplay: "list-item",
		// select: this.handleDateSelect.bind(this),
		eventClick: this.handleEventClick.bind(this),
		eventsSet: this.handleEvents.bind(this)
		/* you can update a remote database when these fire:
			eventAdd:
			eventChange:
			eventRemove:
		*/
	};

	calendarOptionsSmall: CalendarOptions = {
		locales: [enLocale, frLocale],
		height: 500,
		aspectRatio: 0.75,
		schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
		headerToolbar: {
			left: "prev,next",
			center: "title",
			right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
		},
		initialView: "dayGridMonth",
		// initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
		weekends: true,
		editable: false,
		selectable: true,
		selectMirror: true,
		dayMaxEvents: 3,
		showNonCurrentDates: false,
		eventColor: "#ffffff00",
		eventTimeFormat: {
			hour: "numeric",
			minute: "2-digit",
			meridiem: "short"
		},
		themeSystem: "bootstrap",
		eventDisplay: "list-item",
		// select: this.handleDateSelect.bind(this),
		eventClick: this.handleEventClick.bind(this),
		eventsSet: this.handleEvents.bind(this)
		/* you can update a remote database when these fire:
	eventAdd:
	eventChange:
	eventRemove:
	*/
	};

	currentEvents: EventApi[] = [];

	handleCalendarToggle() {
		this.calendarVisible = !this.calendarVisible;
	}

	handleWeekendsToggle() {
		const { calendarOptions } = this;
		calendarOptions.weekends = !calendarOptions.weekends;
	}

	handleDateSelect(selectInfo: DateSelectArg) {
		const promptMsg = this.translate.instant("events.manage.handleDateSelectTitle");

		const title = prompt(promptMsg);
		const calendarApi = selectInfo.view.calendar;

		calendarApi.unselect(); // clear date selection

		if (title) {
			calendarApi.addEvent({
				id: createEventId(),
				title,
				start: selectInfo.startStr,
				end: selectInfo.endStr,
				allDay: selectInfo.allDay
			});
		}
	}

	handleEventClick(clickInfo: EventClickArg) {
		// console.warn("clickInfo >> ", new Date(clickInfo.event.start!).getTime());
		// console.warn("clickInfo event >> ", clickInfo.event.id);
		this.getDateWithId(clickInfo.event.id);
		// this.openModel();
	}

	handleEvents(events: EventApi[]) {
		this.currentEvents = events;
	}

	handleDateClick(arg) {
		alert("date click! " + arg.dateStr);
	}

	ngOnInit(): void {
		this.changeCalenderLocale(null);

		this.languageChangeSub = this.translate.onLangChange.subscribe((languageChangeEvent) => {
			this.changeCalenderLocale(languageChangeEvent);
		});

		this.getAllEvents();

		console.warn("todayDate >> ", this.todayDate);
		this.dialog = document.getElementById("add-new-events");
		this.getSchoolTypeData();
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe(resp => {
			this.schoolTypeData = resp;
		});
	}

	ngOnDestroy(): void {
		this.languageChangeSub?.unsubscribe();
	}

	languageChangeSub!: Subscription;

	changeCalenderLocale(languageChangeEvent: any | null): void {
		// console.log("Locale ID:", this.locale)
		// this.locale = "rw"
		// console.log("Locale ID:", this.locale)

		const currentSiteLangauge = this.siteLanguageService.getCurrentLanguage();

		const fullCalendarAdditionalTranslations = languageChangeEvent?.translations?.common?.fullcalendar;

		const currentCalendarLocales = this.calendarOptions.locales; // locales are the same for 'calendarOptionsSmall'
		const foundCalendarLocale = currentCalendarLocales?.find(item => item.code === languageChangeEvent?.lang);
		// console.log(foundCalendarLocale);

		/* on initial page load or page reload */
		if (!foundCalendarLocale && !(currentSiteLangauge?.code == "fr" || currentSiteLangauge?.code == "en")) {
			const calendarLocale = this.fullCalendarLocaleService.retrieveTranslations(currentSiteLangauge?.code as string);
			currentCalendarLocales?.push(calendarLocale);

			// update the calendar locales
			this.calendarOptions.locales = currentCalendarLocales;
			this.calendarOptionsSmall.locales = currentCalendarLocales;
		}

		// english
		if (currentSiteLangauge?.code === "en") {
			this.calendarOptions.locale = "en-gb";
			this.calendarOptionsSmall.locale = "en-gb";

			// this.locale = "en-gb"
			// console.log("Locale ID:", this.locale);

			/* material date picker */
			this._locale = "en-gb";
			this._adapter.setLocale(this._locale);

			/* owl date-time picker */
			this.dateTimeAdapter.setLocale("en-gb");
			this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
			this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");

			return;
		}

		/* on language change */
		if (languageChangeEvent) {
			if (fullCalendarAdditionalTranslations && languageChangeEvent.lang !== "en") {

				const calendarLocale = this.fullCalendarLocaleService.retrieveTranslations(languageChangeEvent.lang);

				// console.log(calendarLocale);

				const currentCalendarLocales = this.calendarOptions.locales; // locales are the same for 'calendarOptionsSmall'
				const otherCalendarLocales = currentCalendarLocales?.filter(item => item.code !== calendarLocale.code);

				// console.log(otherCalendarLocales);
				otherCalendarLocales?.push(calendarLocale);
				// console.log(otherCalendarLocales);

				// update the calendar locales
				this.calendarOptions.locales = otherCalendarLocales;
				this.calendarOptionsSmall.locales = otherCalendarLocales;

				// this.locale = currentSiteLangauge?.code as string;
				// console.log("Locale ID:", this.locale);

				/* material date picker */
				this._locale = currentSiteLangauge?.code as string;
				this._adapter.setLocale(this._locale);

				/* owl date-time picker */
				this.dateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
				this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
				this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");
			}
		}

		// other languages
		this.calendarOptions.locale = currentSiteLangauge?.code;
		this.calendarOptionsSmall.locale = currentSiteLangauge?.code;

		// this.locale = currentSiteLangauge?.code as string;
		// console.log("Locale ID:", this.locale);

		/* material date picker */
		this._locale = currentSiteLangauge?.code as string;
		this._adapter.setLocale(this._locale);

		/* owl date-time picker */
		this.dateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
		this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
		this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");
	}

	isLoadingEvents = false;
	getAllEvents() {
		let evts: any[] = [];
		this.isLoadingEvents = true;
		this.eventsService.getEvents().subscribe({
			next: (resp: any) => {
				// console.warn("Events >> ", resp);
				this.eventsObj = resp;

				evts = resp;
				evts.forEach((evt: any) => {
					evt.id = evt.schoolEventId;
					if (evt.startDate == evt.endDate) {
						evt.allDay = true;
					}
					evt.start = evt.startDate;
					evt.end = evt.endDate;
				});
				this.calendarOptions = {
					...this.calendarOptions,
					events: evts
				};
				this.calendarOptionsSmall = {
					...this.calendarOptionsSmall,
					events: evts
				};
				this.isLoadingEvents = false;
			},
			error: err => {
				//console.warn(err);
				this.isLoadingEvents = false;

			}
		});
	}

	toggleRange(option: string) {
		console.warn("Range option", option);
		switch (option) {
		case "single":
			this.single_option = true;
			this.range_option = false;
			this.dateSet = true;
			break;
		case "range":
			this.single_option = false;
			this.range_option = true;
			this.dateSet = true;
			break;

		default:
			this.single_option = false;
			this.range_option = false;
			this.dateSet = false;
			break;
		}
	}

	toggleSessRange(option: string) {
		//console.warn("Sess Range option", option);
		switch (option) {
		case "single":
			this.sess_single_option = true;
			this.sess_range_option = false;
			this.dateSet = true;
			break;
		case "range":
			this.sess_single_option = false;
			this.sess_range_option = true;
			this.dateSet = true;
			break;

		default:
			this.sess_single_option = true;
			this.sess_range_option = false;
			this.dateSet = false;
			break;
		}
	}

	deleteEvent(event: any) {
		//console.warn('delete >> ', event);
		this.eventsService.deleteEvents(event.schoolEventId).subscribe({
			next: (resp: any) => {
				// console.warn("Resp delete >> ", resp);
				console.log(resp.response.message);

				const message = this.translate.instant("events.manage.toastMessages.deleteSuccess");
				this.toastService.success(message);

				this.closeEventModal?.nativeElement.click();
				this.getAllEvents();
			},
			error: err => {
				console.error("deleteEvents Err >> ", err);
				// console.log(err.error.response.message);

				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.warning(message);
			}
		});
	}

	getTeacherGroups() {
		this.teacherService.getAllTeacherGroups().subscribe({
			next: (resp: any) => {
				// console.warn('getAllTeacherGroups() >> ', resp);
				resp.unshift({
					"name": "ALL"
				});
				this.teacherGroups = resp;
			},
			error: err => {
				console.error("getAllTeacherGroups() >> ", err);
			}
		});
	}

	// addEventSession() {
	//   //console.log("addEventSession >> ", this.newEventSession);

	//   let idx_participants = 0;
	//   switch (this.newEventSession.participant) {
	//     case 'All':
	//       idx_participants = 1;
	//       break;
	//     case 'Teachers':
	//       idx_participants = 100;
	//       break;
	//     case 'Parents':
	//       idx_participants = 200;
	//       break;

	//     default:
	//       break;
	//   };

	//   // //console.warn("this.event.eventDate >> ", this.event.eventDate, new Date(this.event.eventDate).getTime());
	//   // //console.warn("this.newEventSession.startTime >> ", new Date(this.newEventSession.startTime).getTime());
	//   // //console.warn("this.newEventSession.endTime >> ", new Date(this.newEventSession.endTime).getTime());
	//   //console.warn(this.single_option, this.sess_single_option);
	//   //console.warn(this.newEventSession.endTime);
	//   if (this.sess_single_option) {
	//     //console.warn('Single');
	//     this.newEventSession.startTime = new Date(this.newEventSession.startTime).getTime();
	//     this.newEventSession.endTime = new Date(this.newEventSession.startTime).getTime();
	//   } else if (this.sess_range_option) {
	//     //console.warn('Double');
	//     this.newEventSession.startTime = new Date(this.newEventSession.startTime).getTime();
	//     this.newEventSession.endTime = new Date(this.newEventSession.endTime).getTime();
	//   }

	//   if (!this.newEventSession.schoolEventSessionId) {
	//     // Add
	//     const newSessionObj = {
	//       venue: this.newEventSession.venue || 'School',
	//       startTime: this.newEventSession.startTime,
	//       endTime: this.newEventSession.endTime,
	//       description: this.newEventSession.description || 'No title',
	//       participant: idx_participants,
	//       participantDescription: this.newEventSession.participantDescription == "" ? null : this.newEventSession.participantDescription
	//     };

	//     //console.log("newSessionObj >> ", newSessionObj);

	//     this.eventsService.addEventSession(this.event.schoolEventId!, newSessionObj).subscribe({
	//       next: (resp: any) => {
	//         //console.warn("Resp addEventSession >> ", resp);
	//         this.toastService.success(resp.response.message);
	//         this.getAllEvents();
	//         this.editEvHidden?.nativeElement.click();
	//       },
	//       error: err => {
	//         //console.error("addEventSession Err >> ", err);
	//         this.toastService.error(err.error.response.message);
	//         this.getAllEvents();
	//       }
	//     });
	//   } else {
	//     // Update
	//     const updateSessionObj = {
	//       schoolEventSessionId: this.newEventSession.schoolEventSessionId,
	//       venue: this.newEventSession.venue || 'School',
	//       startTime: this.newEventSession.startTime,
	//       endTime: this.newEventSession.endTime,
	//       description: this.newEventSession.description,
	//       participant: idx_participants,
	//       participantDescription: this.newEventSession.participantDescription == "" ? null : this.newEventSession.participantDescription
	//     };

	//     //console.warn("Resp updateSessionObj >> ", updateSessionObj);

	//     this.eventsService.updateEventSession(this.event.schoolEventId!, updateSessionObj).subscribe({
	//       next: (resp: any) => {
	//         //console.warn("Resp updateEventSession >> ", resp);
	//         this.getAllEvents();
	//         this.toastService.success(resp.response.message);
	//       },
	//       error: err => {
	//         //console.error("addEventSession Err >> ", err);
	//         this.toastService.error(err.response.message);
	//       }
	//     });
	//   }
	// }

	deleteSession(session: any) {
		//console.warn('deleteSession >> ', session);
		this.eventsService.deleteEventSession(this.editEv.schoolEventId!, session.schoolEventSessionId!).subscribe({
			next: (resp: any) => {
				//console.warn("Resp delete sesh>> ", resp);
				console.log(resp.response.message);

				const message = this.translate.instant("events.manage.toastMessages.deleteSessionSuccess");
				this.toastService.success(message);

				this.editEvHidden?.nativeElement.click();
				this.getAllEvents();
			},
			error: err => {
				console.error("deleteSession Err >> ", err);
				// this.toastService.error(err.response.message);

				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.warning(message);
			}
		});
	}

	closeModal() {
		this.dialog?.classList.remove("show");
		this.dialog?.setAttribute("style", "display: none;");
	}

	updateEvent() {
		this.dialog?.classList.remove("show");
		this.dialog?.setAttribute("style", "display: none;");
	}



	eventSide = new SchoolEvent();
	eventSessionSide = new EventSession();

	/**
	 * Add event from side panel
	 * @param eventForm Event form from HTML. Used for reset
	 */
	addEventSide(eventForm: NgForm) {
		// this.closeEventModal?.nativeElement.click();
		// console.warn("Save eventSide >>", this.eventSide);
		// console.warn("Save eventSessionSide >>", this.eventSessionSide.participantDescription[0].name);
		let idx_participants = 0;
		switch (this.eventSessionSide.participant) {
		case "All":
			idx_participants = 1;
			break;
		case "Teachers": {
			idx_participants = 100;
			const participants: any[] = [];
			for (let index = 0; index < this.eventSessionSide.participantDescription.length; index++) {
				const element = this.eventSessionSide.participantDescription[index];
				participants.push(element.name);
			}
			this.eventSessionSide.participantDescription = participants;
			// console.warn('Final participants >> ', this.eventSessionSide.participantDescription);
			break;
		}
		case "Parents":
			idx_participants = 200;
			break;

		default:
			break;
		}

		// //console.warn("this.eventSide.eventDate >> ", this.eventSide.eventDate, new Date(this.eventSide.eventDate).getTime());
		// //console.warn("this.eventSessionSide.startTime >> ", new Date(this.eventSessionSide.startTime).getTime());
		// //console.warn("this.eventSessionSide.endTime >> ", new Date(this.eventSessionSide.endTime).getTime());
		if (this.single_option) {
			//console.warn("Single option");
			this.eventSide.eventDate = new Date(this.eventSide.eventDate).getTime();
			this.eventSessionSide.startTime = new Date(this.eventSide.startDate).getTime();
			this.eventSessionSide.endTime = new Date(this.eventSide.startDate).getTime();
		} else if (this.range_option) {
			// console.warn("Range option >> ", new Date(this.eventSide.startDate[1]).getTime());
			this.eventSide.eventDate = new Date(this.eventSide.startDate[0]).getTime();
			this.eventSessionSide.startTime = new Date(this.eventSide.startDate[0]).getTime();
			this.eventSessionSide.endTime = new Date(this.eventSide.startDate[1]).getTime();
		}

		/**
		 * ADD EVENT
		 */
		const addEv: SchoolEvent = {
			title: this.eventSide.title,
			description: this.eventSide.description || "Event description",
			sessions: [
				{
					venue: this.eventSessionSide.venue || "School",
					description: this.eventSessionSide.description || "Main event",
					startTime: this.eventSessionSide.startTime,
					endTime: this.eventSessionSide.endTime,
					participant: idx_participants,
					participantDescription: this.eventSessionSide.participantDescription == "" ? null : this.eventSessionSide.participantDescription
				}
			]
		};
		console.warn("Final add Obj >> ", addEv);
		this.eventsService.addEvents([addEv]).subscribe({
			next: (resp: any) => {
				//console.warn("Resp >> ", resp);
				console.log(resp.response.message);

				const message = this.translate.instant("events.manage.toastMessages.addSuccess");
				this.toastService.success(message);

				this.getAllEvents();
			},
			error: err => {
				console.error("addEvents Err >> ", err);

				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			},
			complete: () => {
				eventForm.resetForm();
			},
		});
	}

	saveEditEvent(eventForm: NgForm) {
		// this.closeEventModal?.nativeElement.click();
		console.warn("Save event >>", this.editEv);
		console.warn("Save editEventSession >>", this.editEventSession.participantDescription[0].name);
		console.warn("editEventSession.startTime >> ", this.editEventSession.startTime);

		let idx_participants = 0;
		switch (this.editEventSession.participant) {
		case "All":
			idx_participants = 1;
			break;
		case "Teachers": {
			idx_participants = 100;
			const participants: any[] = [];
			for (let index = 0; index < this.editEventSession.participantDescription.length; index++) {
				const element = this.editEventSession.participantDescription[index];
				participants.push(element.name);
			}
			this.editEventSession.participantDescription = participants;
			// console.warn('Final participants >> ', this.editEventSession.participantDescription);
			break;
		}
		case "Parents":
			idx_participants = 200;
			break;

		default:
			break;
		}

		// //console.warn("this.eventSide.eventDate >> ", this.eventSide.eventDate, new Date(this.eventSide.eventDate).getTime());
		// console.warn("this.editEventSession.startTime >> ", new Date(this.editEventSession.startTime).getTime());
		// console.warn("this.editEventSession.endTime >> ", new Date(this.editEventSession.endTime).getTime());
		if (this.sess_single_option) {
			console.warn("Single option");
			this.editEv.eventDate = new Date(this.editEv.startDate).getTime();
			this.editEventSession.startTime = new Date(this.editEv.startDate).getTime();
			this.editEventSession.endTime = new Date(this.editEv.startDate).getTime();
		} else if (this.sess_range_option) {
			console.warn("Range option");
			this.editEv.eventDate = new Date(this.editEventSession.startTime[0]).getTime();
			this.editEventSession.startTime = new Date(this.editEventSession.startTime[0]).getTime();
			this.editEventSession.endTime = new Date(this.editEventSession.startTime[1]).getTime();
		}

		// console.log("Save event >>", this.editEv);
		// console.log("Save editEventSession >>", this.editEventSession.startTime);


		/**
	 * UPDATE EVENT
	 */
		const updateEv: SchoolEvent = {
			schoolEventId: this.editEv.schoolEventId,
			title: this.editEv.title,
			description: this.editEv.description || "Event description",
			sessions: [
				{
					venue: this.editEventSession.venue || "School",
					description: this.editEventSession.description || "Main event",
					startTime: this.editEventSession.startTime,
					endTime: this.editEventSession.endTime,
					participant: idx_participants,
					participantDescription: this.editEventSession.participantDescription || ""
				}
			]
		};
		console.warn("Final update Obj >> ", updateEv);
		this.eventsService.updateEvents([updateEv]).subscribe({
			next: (resp: any) => {
				//console.warn("Resp >> ", resp);
				console.log(resp.response.message);

				const message = this.translate.instant("events.manage.toastMessages.updateSuccess");
				this.toastService.success(message);

				eventForm.resetForm();
				this.closeEventModal?.nativeElement.click();
				this.getAllEvents();
			},
			error: err => {
				console.error("addEvents Err >> ", err);

				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.warning(message);
			}
		});
	}

	/**
	 * Fetch event with id provided by Full calendar
	 * @param id Selected date id
	 */
	getDateWithId(id: any) {
		this.eventsService.getEvents(id).subscribe({
			next: (resp: any) => {
				// console.warn("getEventById >> ", resp);
				this.editEvent(resp);
				this.editSession(resp.sessions[0]);
			},
			error: err => {
				console.error("getEventById > ", err);
			}
		});
	}

	editEvent(et: any) {
		this.addEditEvent = false;
		this.editEv = et;
		// console.warn("Edit event >> ", et);
		this.editEventSession = et.sessions[0];
		this.editEv.eventDate = new Date(this.editEv.eventDate);
		this.viewEditEvHidden?.nativeElement.click();
	}

	editSession(session: any) {
		// console.log("editSession >> ", session);
		this.editEventSession = session;
		this.evSession = this.editEventSession.description;

		switch (this.editEventSession.participant) {
		case 1:
			this.editEventSession.participant = "All";
			break;
		case 100:
			this.editEventSession.participant = "Teachers";
			break;
		case 200:
			this.editEventSession.participant = "Parents";
			break;

		default:
			break;
		}


		if (new Date(this.editEventSession.startTime).getDate() != new Date(this.editEventSession.endTime).getDate()) {
			this.sess_single_option = false;
			this.sess_range_option = true;
		} else {
			this.sess_single_option = true;
			this.sess_range_option = false;
		}

		if (this.sess_single_option) {
			// new Date().getDate
			this.editEventSession.startTime = new Date(this.editEventSession.startTime);
			this.editEventSession.endTime = new Date(this.editEventSession.endTime);
		} else {
			// new Date().getDate
			this.editEventSession.startTime = [new Date(this.editEventSession.startTime), new Date(this.editEventSession.endTime)];
		}
	}

	seeChange() {
		console.warn("this.eventSide.startDate >> ", this.eventSide.startDate);
	}


}
