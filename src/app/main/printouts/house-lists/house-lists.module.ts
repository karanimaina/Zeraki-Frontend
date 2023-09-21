import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HouseListsRoutingModule } from './house-lists-routing.module';
import { HouseListsComponent } from './house-lists.component';
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../../@core/shared/shared.module";


@NgModule({
  declarations: [
    HouseListsComponent
  ],
	imports: [
		CommonModule,
		HouseListsRoutingModule,
		ReactiveFormsModule,
		SharedModule
	]
})
export class HouseListsModule { }
