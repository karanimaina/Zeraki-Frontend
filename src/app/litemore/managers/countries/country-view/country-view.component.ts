import { Component, OnInit } from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {LitemoreService} from "../../../../@core/services/litemore/litemore.service";

@Component({
	selector: "app-country-view",
	templateUrl: "./country-view.component.html",
	styleUrls: ["./country-view.component.scss"]
})
export class CountryViewComponent implements OnInit {

	countryId!:number;
	country:any;
	isLoadingCountry = true;
	failedLoadingCountry = false;
	constructor(
		private activatedRoute:ActivatedRoute,
		private router:Router,
		private litemoreService:LitemoreService) {

	}

	ngOnInit(): void {
		this.countryId = this.activatedRoute.snapshot.params.id;
		this.loadCountry();
	}

	loadCountry() {
		this.isLoadingCountry = true;
		this.litemoreService.getCountryById(this.countryId).subscribe(
			(country)=>{
				this.country = country[0];
				this.isLoadingCountry = false;
				this.failedLoadingCountry = false;
			},
			(error)=>{
				this.failedLoadingCountry = true;
				this.isLoadingCountry = false;
			}
		);
	}
	back() {
		this.router.navigate(["/litemore/mg/countries"]);
	}
}
