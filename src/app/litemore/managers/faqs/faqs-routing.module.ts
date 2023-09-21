import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FaqsComponent } from "./faqs.component";
import {
	FaqCategoriesComponent,
	FaqCategoriesListComponent,
	FaqCategoryDetailsComponent,
	FaqListComponent
} from "./pages";

const routes: Routes = [
	{
		path: "", component: FaqsComponent,
		children: [
			{
				path: "",
				component: FaqListComponent
			},
			{
				path: "categories",
				component: FaqCategoriesComponent,
				children: [
					{
						path: "",
						component: FaqCategoriesListComponent
					},
					{
						path: ":categoryID",
						component: FaqCategoryDetailsComponent
					}
				]
			},
		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FaqsRoutingModule { }
