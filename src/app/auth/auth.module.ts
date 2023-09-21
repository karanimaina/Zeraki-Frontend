import { NgModule } from "@angular/core";
import { AuthComponent } from "./auth.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { AuthRoutingModule } from "./auth-routing.module";
import { CommonModule } from "@angular/common";
import { TeamProfileComponent } from "../@core/shared/components/team-profile/team-profile.component";
import { CarouselModule } from "ngx-owl-carousel-o";
import { MatExpansionModule } from "@angular/material/expansion";
import { AuthMobileComponent } from "./auth-mobile/auth-mobile.component";
import { AppInfoComponent } from "./app-info/app-info.component";
import { HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { TranslateModule } from "@ngx-translate/core";
import { MobileComponent } from "./mobile/mobile.component";
import { DesktopComponent } from "./desktop/desktop.component";

@NgModule({
	declarations: [
		AuthComponent,
		TeamProfileComponent,
		AuthMobileComponent,
		AppInfoComponent,
		MobileComponent,
		DesktopComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		AuthRoutingModule,
		NgSelectModule,
		CarouselModule,
		MatExpansionModule,
		ReactiveFormsModule,
		HammerModule,
		TranslateModule,
	],
	providers: [
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: HammerGestureConfig
		}
	]
})
export class AuthModule { }
