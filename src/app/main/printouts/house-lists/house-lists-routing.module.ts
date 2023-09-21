import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HouseListsComponent } from './house-lists.component';

const routes: Routes = [{
	path:'',
	component:HouseListsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HouseListsRoutingModule { }
