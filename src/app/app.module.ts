import { ClassProvider, DEFAULT_CURRENCY_CODE, Injectable, Injector, NgModule } from "@angular/core";
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import * as Hammer from "hammerjs";
import { FullCalendarModule } from "@fullcalendar/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { HotToastModule } from "@ngneat/hot-toast";
import { LoadingBarHttpClientModule } from "@ngx-loading-bar/http-client";

import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // a plugin!
import timelinePlugin from "@fullcalendar/timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { NgxTranslateModule } from "./translate.module";
import { AuthRefreshInterceptor } from "./@core/shared/interceptors/auth-refresh.interceptor";
import { RetryInterceptor } from "./@core/shared/interceptors/retry.interceptor";
// import { RefreshAuthInterceptor } from "./@core/shared/interceptors/refresh-auth.interceptor";
// import { RefreshTokenInterceptor } from "./@core/shared/interceptors/refresh-token.interceptor";

export let AppInjector: Injector;

// custom configuration Hammerjs
@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
	overrides = <any>{
		"swipe": { direction: Hammer.DIRECTION_ALL },
	};
}

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
	dayGridPlugin,
	timeGridPlugin,
	listPlugin,
	interactionPlugin,
	timelinePlugin
]);

export const RETRY_PROVIDER: ClassProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: RetryInterceptor,
	multi: true
};


@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		HammerModule,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		SweetAlert2Module.forRoot(),
		BrowserAnimationsModule,
		HotToastModule.forRoot(),
		LoadingBarHttpClientModule,
		FullCalendarModule,
		NgxTranslateModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS, useClass: AuthRefreshInterceptor, multi: true
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: MyHammerConfig,
		},
		{
			provide: DEFAULT_CURRENCY_CODE, useValue: "KES "
		},
		RETRY_PROVIDER
	],
	bootstrap: [AppComponent]
})


export class AppModule {
	constructor(private injector: Injector) {
		AppInjector = this.injector;
	}
}
