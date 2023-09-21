import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CalendarOptions, EventApi, EventClickArg } from "@fullcalendar/angular";
import enLocale from "@fullcalendar/core/locales/en-gb";
import frLocale from "@fullcalendar/core/locales/fr";
import { HotToastService } from "@ngneat/hot-toast";
import { fromEvent, Observable, Subject, Subscription } from "rxjs";
import { EventSession, SchoolEvent } from "src/app/@core/models/school-event";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DeviceDetectorService } from "ngx-device-detector";
import { TranslateService } from "@ngx-translate/core";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { FullCalendarLocaleService } from "src/app/@core/shared/services/fullcalendar-locale-additions.service";
import {
	MAT_MOMENT_DATE_FORMATS,
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import "../../../@core/constants/moment-js-locale-additions/rw";
import "../../../@core/constants/moment-js-locale-additions/am";
// import "moment/locale/rw";
// import "moment/locale/am";
import "moment/locale/fr";
import "moment/locale/sw";
import "moment/locale/en-gb";
import { DateTimeAdapter } from "@danielmoncada/angular-datetime-picker";
import { Location } from "@angular/common";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";
import { Router } from "@angular/router";
import { SchoolSummary } from "src/app/@core/models/school-summary/summary";
import { UserInfo } from "src/app/@core/models/user-info";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { DashboardService } from "src/app/@core/services/dashboard/dashboard.service";
import { EventsService } from "src/app/@core/services/events/events.service";
import { TeacherService } from "src/app/@core/services/teacher/teacher.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { OwlOptions } from "ngx-owl-carousel-o";
import { BannerService } from "src/app/@core/services/banner/banner.service";
import { Banner } from "src/app/@core/models/banners/banner";

@Component({
	selector: "app-welcome",
	templateUrl: "./welcome.component.html",
	styleUrls: ["./welcome.component.scss"],
	encapsulation: ViewEncapsulation.None, // USED BY dateClass() TO ADD MatCalendarCellCssClasses CSS
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
export class WelcomeComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	dashSummary$: Observable<SchoolSummary> = this.summaryService.schoolSummary$;
	recents$?: Observable<any[]>;
	dialog: any;
	single_option = true;
	range_option = false;
	teacherGroups: any[] = [];
	events: any[] = [];
	closestEvs: any[] = [];
	// recents: any;
	banners: Array<Banner> = [];
	loggedInUser: any;
	userInfo!: UserInfo;
	userDp: any;
	event: SchoolEvent = new SchoolEvent();
	eventSession: EventSession = new EventSession();
	newEventSession: EventSession = new EventSession();
	evSession: any;
	sess_single_option = true;
	sess_range_option = false;
	todayDate = new Date();
	addEditEvent = false;

	displayCalendar = false;
	private locationSub?: Subscription;

	@ViewChild("closeEventModal") closeEventModal?: ElementRef;
	@ViewChild("closeNewEventModal") closeNewEventModal?: ElementRef;
	@ViewChild("closeViewEv") closeViewEv?: ElementRef;
	@ViewChild("editEvHidden") editEvHidden?: ElementRef;
	@ViewChild("viewEditEvHidden") viewEditEvHidden?: ElementRef;


	currentEvents: EventApi[] = [];
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	schoolDataType!: SchoolTypeData;
	isDesktopDevice?: boolean;

	constructor(
		private authService: AuthService,
		private summaryService: SummaryService,
		private userService: UserService,
		private router: Router,
		private location: Location,
		private deviceService: DeviceDetectorService,
		private dashboardService: DashboardService,
		private eventsService: EventsService,
		private dataService: DataService,
		private teacherService: TeacherService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private siteLanguageService: SiteLanguageService,
		private rolesService: RolesService,
		private responseHandler: ResponseHandlerService,
		private fullCalendarLocaleService: FullCalendarLocaleService,
		private dateTimeAdapter: DateTimeAdapter<any>,
		private _adapter: DateAdapter<any>,
		public networkService: NetworkService,
		public bannerService: BannerService,
		@Inject(MAT_DATE_LOCALE) private _locale: string,
	) {
		// when location change...
		// close modals...
		this.location.subscribe(location => {
			// ...close popup
			this.closeEventModal?.nativeElement.click();
			this.closeViewEv?.nativeElement.click();
		});

		this.dataService.schoolData.subscribe((schoolDataType) => {
			this.schoolDataType = schoolDataType;
		});

	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.languageChangeSub?.unsubscribe();
		this.locationSub?.unsubscribe();
	}

	calendarOptionsSmall: CalendarOptions = {
		locales: [enLocale, frLocale],
		height: 312,
		themeSystem: "bootstrap",
		schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
		headerToolbar: {
			left: "prev,next",
			center: "title",
			right: "dayGridMonth,timeGridWeek,timeGridDay"
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
		eventTimeFormat: { // like '14:30:00'
			hour: "numeric",
			minute: "2-digit",
			meridiem: "short"
		},
		eventDisplay: "list-item",
		// select: this.handleDateSelect.bind(this),
		eventClick: this.handleEventClick.bind(this),
		/* you can update a remote database when these fire:
	eventAdd:
	eventChange:
	eventRemove:
	*/
	};

	handleEventClick(clickInfo: EventClickArg) {
		// console.warn("clickInfo >> ", new Date(clickInfo.event.start!).getTime());
		// console.warn("clickInfo event >> ", clickInfo.event.id);
		this.getDateWithId(clickInfo.event.id);
		// this.openModel();
	}

	languageChangeSub!: Subscription;

	changeCalenderLocale(languageChangeEvent: any | null): void {
		const currentSiteLangauge = this.siteLanguageService.getCurrentLanguage();

		// console.log("locales:", this.calendarOptionsSmall.locales);

		const fullCalendarAdditionalTranslations = languageChangeEvent?.translations?.common?.fullcalendar;
		// console.log(fullCalendarAdditionalTranslations);

		const currentCalendarLocales = this.calendarOptionsSmall.locales;
		const foundCalendarLocale = currentCalendarLocales?.find(item => item.code === languageChangeEvent?.lang);
		// console.log(foundCalendarLocale);

		/* on initial page load or page reload */
		if (!foundCalendarLocale && !(currentSiteLangauge?.code == "fr" || currentSiteLangauge?.code == "en")) {
			const calendarLocale = this.fullCalendarLocaleService.retrieveTranslations(currentSiteLangauge?.code as string);
			currentCalendarLocales?.push(calendarLocale);

			// update the calendar locales
			this.calendarOptionsSmall.locales = currentCalendarLocales;
		}

		// english
		if (currentSiteLangauge?.code === "en") {
			this.calendarOptionsSmall.locale = "en-gb";

			/* material date picker */
			this._locale = "en-gb";
			this._adapter.setLocale(this._locale);

			/* owl date-time picker */
			this.dateTimeAdapter.setLocale("en-gb");

			return;
		}

		/* on language change */
		if (languageChangeEvent) {
			if (fullCalendarAdditionalTranslations && languageChangeEvent.lang !== "en") {

				const calendarLocale = this.fullCalendarLocaleService.retrieveTranslations(languageChangeEvent.lang);

				// console.log(calendarLocale);

				const currentCalendarLocales = this.calendarOptionsSmall.locales;
				const otherCalendarLocales = currentCalendarLocales?.filter(item => item.code !== calendarLocale.code);

				// console.log(otherCalendarLocales);
				otherCalendarLocales?.push(calendarLocale);
				// console.log(otherCalendarLocales);

				// update the calendar locales
				this.calendarOptionsSmall.locales = otherCalendarLocales;

				/* material date picker */
				this._locale = currentSiteLangauge?.code as string;
				this._adapter.setLocale(this._locale);

				/* owl date-time picker */
				this.dateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
			}
		}

		// other languages
		this.calendarOptionsSmall.locale = currentSiteLangauge?.code;

		/* material date picker */
		this._locale = currentSiteLangauge?.code as string;
		this._adapter.setLocale(this._locale);

		/* owl date-time picker */
		this.dateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
	}

	ngOnInit(): void {
		this.checkIfStudentTemporaryFix();
		// when location change...
		history.pushState(null, "", window.location.href);
	}

	checkIfStudentTemporaryFix() {
		if (this.authService.loggedInUser.roles.isStudent) {
			this.router.navigateByUrl(`/main/students/analytics/${this.authService.loggedInUser.userid}`);
		} else {
			this.initWelcome();
		}
	}

	initWelcome() {
		// // check if back or forward button is pressed.
		// this.locationStrat.onPopState(() => {
		// 	console.warn("Back pressed");
		// 	history.pushState(null, "", window.location.href);
		// });
		this.locationSub = fromEvent(window, "popstate").subscribe(() => {
			// doCustomRefresh()
			console.warn("Back pressed",);
			history.pushState(null, "", window.location.href);
		});

		this.changeCalenderLocale(null);

		this.languageChangeSub = this.translate.onLangChange.subscribe((languageChangeEvent) => {
			this.changeCalenderLocale(languageChangeEvent);
		});

		this.isDesktopDevice = this.deviceService.isDesktop();
		//console.warn('this.isDesktopDevice >> ', this.isDesktopDevice);

		this.getUserDetails();
		this.dialog = document.getElementById("edit-event");
		this.getBanners();
		// this.getDashboardSummary();

		this.recents$ = this.dashboardService.getRecentExam();

		this.getAllEvents();
		this.getTeacherGroups();
	}

	closeModal() {
		this.dialog?.classList.remove("show");
		this.dialog?.setAttribute("style", "display: none;");
	}

	updateEvent() {
		this.dialog?.classList.remove("show");
		this.dialog?.setAttribute("style", "display: none;");
	}

	carouselOptions: OwlOptions = {
		loop: true,
		autoplay: true,
		autoplaySpeed: 1000,
		mouseDrag: false,
		touchDrag: false,
		pullDrag: false,
		dots: false,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
		},
	};

	private getBanners() {
		this.bannerService.getBanners().subscribe({
			next: (resp: any) => this.banners = resp,
			error: err => console.error("Banner error > ", err),
		});
	}

	getUserDetails() {
		// this.loggedInUser = this.dataService.getTokenData().user.user;
		// this.loggedInUser.name = this.loggedInUser.name || "Test Login";
		this.userService.userInfoSubject.subscribe(val => {
			// console.warn("userInfo >> ", val);
			this.userInfo = val;
			this.userDp = this.dataService.getUserImage(this.userInfo?.url);
		});
	}

	getAllEvents() {
		let evts: any[] = [];
		let upcomingEvs: any[] = [];
		this.eventsService.getEvents().subscribe({
			next: (resp: any) => {
				// console.warn("Events >> ", resp);
				this.events = resp;
				evts = resp;

				evts.forEach((evt: any) => {
					// Get upcoming events (From today onwards)
					// TODO: Filter past events from backend.
					if (new Date(evt.startDate) > new Date()) {
						// evt.color = '#6f42c1';
						// evt.textColor = 'white';
						// evt.borderColor = '#6f42c1'

						// Mark all events as all day
						evt.allDay = true;
						upcomingEvs = [...upcomingEvs, evt];
					}

					// PAST EVENTS
					// if (new Date(evt.startDate) < new Date()) {
					//   // evt.color = '#6f42c1';
					//   // evt.textColor = 'white';
					//   // evt.borderColor = '#6f42c1'
					//   // evt.display = 'none';
					//   evt.display = 'background'
					// }

					// Edit event object to fit full calendar formart
					evt.id = evt.schoolEventId;
					if (evt.startDate == evt.endDate) {
						evt.allDay = true;
					}


					evt.start = evt.startDate;
					evt.end = evt.endDate;
				});
				this.calendarOptionsSmall = {
					...this.calendarOptionsSmall,
					events: evts
				};
				const sortedEvents: any[] = upcomingEvs.sort((a, b) => a.startDate - b.startDate);
				this.closestEvs = sortedEvents.slice(0, 3);
				this.closestEvs.length > 0 ? this.displayCalendar = false : this.displayCalendar = true;
				// console.warn("Sorted activities >> ", this.closestEvs);
			},
			error: err => {
				this.responseHandler.error(err, "getAllEvents()");
			}
		});
	}


	toggleRange(option: string) {
		console.warn("Range option", option);
		switch (option) {
		case "single":
			this.single_option = true;
			this.range_option = false;
			break;
		case "range":
			this.single_option = false;
			this.range_option = true;
			break;

		default:
			this.single_option = false;
			this.range_option = false;
			break;
		}
	}

	editSession(session: any) {
		// console.log("editSession >> ", session);
		this.newEventSession = session;
		this.evSession = this.newEventSession.description;

		switch (this.newEventSession.participant) {
		case 1:
			this.newEventSession.participant = "All";
			break;
		case 100:
			this.newEventSession.participant = "Teachers";
			break;
		case 200:
			this.newEventSession.participant = "Parents";
			break;

		default:
			break;
		}


		if (new Date(this.newEventSession.startTime).getDate() != new Date(this.newEventSession.endTime).getDate()) {
			this.sess_single_option = false;
			this.sess_range_option = true;
		} else {
			this.sess_single_option = true;
			this.sess_range_option = false;
		}

		if (this.sess_single_option) {
			this.newEventSession.startTime = new Date(this.newEventSession.startTime);
			this.newEventSession.endTime = new Date(this.newEventSession.endTime);
		} else {
			this.newEventSession.startTime = [new Date(this.newEventSession.startTime), new Date(this.newEventSession.endTime)];
		}
	}

	toggleSessRange(option: string) {
		console.warn("Sess Range option", option);
		switch (option) {
		case "single":
			this.sess_single_option = true;
			this.sess_range_option = false;
			break;
		case "range":
			this.sess_single_option = false;
			this.sess_range_option = true;
			break;

		default:
			this.sess_single_option = true;
			this.sess_range_option = false;
			break;
		}
	}

	addNew() {
		this.event = new SchoolEvent();
		this.eventSession = new EventSession();
	}

	addEvent(eventForm: NgForm) {
		let idx_participants = 0;
		switch (this.eventSession.participant) {
		case "All":
			idx_participants = 1;
			break;
		case "Teachers": {
			idx_participants = 100;
			const participants: any[] = [];
			for (let index = 0; index < this.eventSession.participantDescription.length; index++) {
				const element = this.eventSession.participantDescription[index];
				participants.push(element.name);
			}
			this.eventSession.participantDescription = participants;
			break;
		}
		case "Parents":
			idx_participants = 200;
			break;

		default:
			break;
		}

		// console.warn("this.event.eventDate >> ", this.event.eventDate, new Date(this.event.eventDate).getTime());
		// console.warn("this.eventSession.startTime >> ", new Date(this.eventSession.startTime).getTime());
		// console.warn("this.eventSession.endTime >> ", new Date(this.eventSession.endTime).getTime());
		if (this.single_option) {
			// console.warn("Single option");
			this.event.eventDate = new Date(this.event.eventDate).getTime();
			this.eventSession.startTime = new Date(this.event.startDate).getTime();
			this.eventSession.endTime = new Date(this.event.startDate).getTime();
		} else if (this.range_option) {
			// console.warn("Range option");
			this.event.eventDate = new Date(this.event.startDate[0]).getTime();
			this.eventSession.startTime = new Date(this.event.startDate[0]).getTime();
			this.eventSession.endTime = new Date(this.event.startDate[1]).getTime();
		}
		if (this.event.schoolEventId) {
			// UPDATE
			const updateEv = {
				schoolEventId: this.event.schoolEventId,
				title: this.event.title,
				// eventDate: this.event.eventDate,
			};
			// console.warn("Final updateEnv Obj >> ", updateEv);
			this.eventsService.updateEvents([updateEv]).subscribe({
				next: (resp: any) => {
					this.addEventSession();
					this.single_option = true;
					// console.warn("Resp update >> ", resp);

					// console.log(resp.response.message);

					const message = this.translate.instant("dashboard.welcome.toastMessages.updateEventSuccess");
					this.toastService.success(message);

					eventForm.resetForm();
					this.closeEventModal?.nativeElement.click();
				},
				error: err => {
					this.responseHandler.error(err, "addEvent()");
				}
			});
		} else {
			// ADD

			const addEv: SchoolEvent = {
				title: this.event.title,
				description: this.event.description || "Event description",
				sessions: [
					{
						venue: this.eventSession.venue || "School",
						description: this.eventSession.description || "Main event",
						startTime: this.eventSession.startTime,
						endTime: this.eventSession.endTime,
						participant: idx_participants,
						participantDescription: this.eventSession.participantDescription == "" ? null : this.eventSession.participantDescription
					}
				]
			};
			// console.warn("Final add Obj >> ", addEv);
			this.eventsService.addEvents([addEv]).subscribe({
				next: (resp: any) => {
					// console.warn("Resp >> ", resp);
					this.single_option = true;

					// console.log(resp.response.message);

					const message = this.translate.instant("dashboard.welcome.toastMessages.addEventSuccess");
					this.toastService.success(message);

					eventForm.resetForm();
					this.closeNewEventModal?.nativeElement.click();
					this.getAllEvents();
				},
				error: err => {
					this.responseHandler.error(err, "addEvent()");
				}
			});
		}
	}


	editEventCenter(et: any) {
		this.event = et;
		this.eventSession = et.sessions[0];
		this.editSession(this.eventSession);
		this.event.eventDate = new Date(this.event.eventDate);
		// console.warn("Edit editEventCenter >> ", et);
		this.viewEditEvHidden?.nativeElement.click();
	}

	deleteEvent(event: any) {
		console.warn("delete >> ", event);
		this.eventsService.deleteEvents(event.schoolEventId).subscribe({
			next: (resp: any) => {
				// console.warn("Resp delete >> ", resp);

				// console.log(resp.response.message);

				const message = this.translate.instant("dashboard.welcome.toastMessages.deleteEventSuccess");
				this.toastService.success(message);

				this.getAllEvents();
				this.closeEventModal?.nativeElement.click();
			},
			error: err => {
				this.responseHandler.error(err, "deleteEvent()");
				this.closeEventModal?.nativeElement.click();
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
				this.responseHandler.error(err, "getTeacherGroups()");
			}
		});
	}

	/**
	 * Wait for api to get events using date to implement this.
	 * @param id Selected date id
	 */
	getDateWithId(id: any) {
		this.eventsService.getEvents(id).subscribe({
			next: (resp: any) => {
				// console.warn("getEventByDate >> ", resp);
				this.editEvent(resp);
				this.editSession(resp.sessions[0]);
			},
			error: err => {
				this.responseHandler.error(err, "getDateWithId()");
			}
		});
	}


	addEventSession() {
		console.log("addEventSession >> ", this.newEventSession);

		let idx_participants = 0;
		switch (this.newEventSession.participant) {
		case "All":
			idx_participants = 1;
			break;
		case "Teachers":
			idx_participants = 100;
			this.newEventSession.participantDescription = this.newEventSession.participantDescription.name;
			break;
		case "Parents":
			idx_participants = 200;
			break;

		default:
			break;
		}

		// //console.warn("this.event.eventDate >> ", this.event.eventDate, new Date(this.event.eventDate).getTime());
		// //console.warn("this.newEventSession.startTime >> ", new Date(this.newEventSession.startTime).getTime());
		// //console.warn("this.newEventSession.endTime >> ", new Date(this.newEventSession.endTime).getTime());
		//console.warn(this.single_option, this.sess_single_option);
		//console.warn(this.newEventSession.endTime);
		if (this.sess_single_option) {
			//console.warn('Single');
			this.newEventSession.startTime = new Date(this.newEventSession.startTime).getTime();
			this.newEventSession.endTime = new Date(this.newEventSession.startTime).getTime();
		} else if (this.sess_range_option) {
			//console.warn('Double');
			this.newEventSession.startTime = new Date(this.newEventSession.startTime).getTime();
			this.newEventSession.endTime = new Date(this.newEventSession.endTime).getTime();
		}

		if (!this.newEventSession.schoolEventSessionId) {
			// Add
			const newSessionObj = {
				venue: this.newEventSession.venue || "School",
				startTime: this.newEventSession.startTime,
				endTime: this.newEventSession.endTime,
				description: this.newEventSession.description || "No title",
				participant: idx_participants,
				participantDescription: this.newEventSession.participantDescription == "" ? null : this.newEventSession.participantDescription
			};

			//console.log("newSessionObj >> ", newSessionObj);

			this.eventsService.addEventSession(this.event.schoolEventId!, newSessionObj).subscribe({
				next: (resp: any) => {
					//console.warn("Resp addEventSession >> ", resp);
					console.log(resp.response.message);

					const message = this.translate.instant("dashboard.welcome.toastMessages.addEventSessionSuccess");
					this.toastService.success(message);

					this.getAllEvents();
					this.editEvHidden?.nativeElement.click();
				},
				error: err => {
					this.responseHandler.error(err, "addEventSession()");

					this.getAllEvents();
				}
			});
		} else {
			// Update

			const updateSessionObj = {
				schoolEventSessionId: this.newEventSession.schoolEventSessionId,
				venue: this.newEventSession.venue || "School",
				startTime: this.newEventSession.startTime,
				endTime: this.newEventSession.endTime,
				description: this.newEventSession.description,
				participant: idx_participants,
				participantDescription: this.newEventSession.participantDescription == "" ? null : this.newEventSession.participantDescription
			};

			//console.warn("Resp updateSessionObj >> ", updateSessionObj);

			this.eventsService.updateEventSession(this.event.schoolEventId!, updateSessionObj).subscribe({
				next: (resp: any) => {
					//console.warn("Resp updateEventSession >> ", resp);
					this.getAllEvents();

					console.log(resp.response.message);

					const message = this.translate.instant("dashboard.welcome.toastMessages.updateEventSessionSuccess");
					this.toastService.success(message);
				},
				error: err => {
					this.responseHandler.error(err, "addEventSession()");
				}
			});
		}
	}

	deleteSession(session: any) {
		//console.warn('deleteSession >> ', session);
		this.eventsService.deleteEventSession(this.event.schoolEventId!, session.schoolEventSessionId!).subscribe({
			next: (resp: any) => {
				console.warn("Resp delete sesh>> ", resp);

				const message = this.translate.instant("dashboard.welcome.toastMessages.deleteEventSessionSuccess");
				this.toastService.success(message);

				this.getAllEvents();
			},
			error: err => {
				this.responseHandler.error(err, "deleteSession()");
			}
		});
	}

	editEv: SchoolEvent = new SchoolEvent();
	editEventSession: EventSession = new EventSession();
	/**
	 * SAVE EDITED EVENT
	 * @param eventForm Form to be reset
	 */
	saveEditEvent(eventForm: NgForm) {
		// console.warn("Save editEv >>", this.editEv);
		// console.warn("Save editEventSession >>", this.editEventSession);
		// console.warn('editEventSession.startTime >> ', this.editEventSession.startTime)

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
			this.editEv.eventDate = new Date(this.editEventSession.startTime).getTime();
			this.editEventSession.startTime = new Date(this.editEventSession.startTime).getTime();
			this.editEventSession.endTime = new Date(this.editEventSession.startTime).getTime();
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

				const message = this.translate.instant("dashboard.welcome.toastMessages.updateEventSuccess");
				this.toastService.success(message);

				eventForm.resetForm();
				this.closeEventModal?.nativeElement.click();
				this.getAllEvents();
			},
			error: err => {
				this.responseHandler.error(err, "saveEditEvent()");
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

}

