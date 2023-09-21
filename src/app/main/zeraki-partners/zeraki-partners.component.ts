import { Component, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-zeraki-partners",
	templateUrl: "./zeraki-partners.component.html",
	styleUrls: ["./zeraki-partners.component.scss"]
})
export class ZerakiPartnersComponent implements OnInit {

	//navigation variables
	showMySchools = true;
	showAccountDetails = false;

	//Data
	mySchools: any;
	accountDetails: any;

	//controller vars
	isLoadingSchools = false;
	isLoadingAccountDetails = false;
	isUpdatingAccountDetails = false;


	constructor(private dataService: DataService, private toastService: HotToastService) { }

	ngOnInit(): void {
		this.loadSchools();
		this.loadAccountDetails();
	}

	loadSchools() {
		this.isLoadingSchools = true;
		const url = "groups/zerakipartners/schools";
		this.dataService.get(url).subscribe(
			(e) => {
				this.mySchools = e;
				this.isLoadingSchools = false;
			},
			(e) => {
				this.toastService.error("An error occured");
				this.isLoadingSchools = false;
				console.log(e);
			},
		);
	}

	loadAccountDetails() {
		const url = "groups/zerakipartners/account";
		this.isLoadingAccountDetails = true;
		this.dataService.get(url).subscribe(
			(e) => {
				this.accountDetails = e;
				this.isLoadingAccountDetails = false;
			},
			(e) => {
				console.log("An error occured");
				this.isLoadingAccountDetails = false;
			},
		);
	}

	onMenuClicked() {
		this.showMySchools = !this.showMySchools;
		this.showAccountDetails = !this.showAccountDetails;
	}

	updateAccountDetails(account: any) {
		const url = "groups/zerakipartners/account";
		this.isUpdatingAccountDetails = !this.isUpdatingAccountDetails;
		this.dataService.post(account, url).subscribe(
			(e: any) => {
				this.toastService.success(e.message);
				if (e.responseCode == 200) {
					this.accountDetails = account;
				}
				this.isUpdatingAccountDetails = !this.isUpdatingAccountDetails;
			},
			(e) => {
				console.log(e);
				this.isUpdatingAccountDetails = !this.isUpdatingAccountDetails;
			}
		);
	}

	getSchools(){
		return {"schools":[{"account_manager":"Zilpa Zani","registration_date":"15/Sep/2019","schoolid":928,"name":"Nyabondo High School","county":"Kisumu"},{"account_manager":"Belinder Menye","registration_date":"06/Feb/2020","schoolid":1454,"name":"ST. MATHEW'S GIRLS SEPTONOK","county":"Nandi"},{"account_manager":"Wycliffe Ayodo","registration_date":"18/Jan/2021","schoolid":3252,"name":"BIBIRIONI HIGH SCHOOL- LIMURU","county":"Kiambu"},{"account_manager":"Joseph Wainaina","registration_date":"20/May/2021","schoolid":9788,"name":"KIRU BOYS HIGH SCHOOL","county":"Murang'a"},{"account_manager":"Maureen Waringa ","registration_date":"10/Sep/2021","schoolid":15253,"name":"IKUNDU SECONDARY SCHOOL","county":"Murang'a"},{"account_manager":"Joseph Wainaina","registration_date":"23/Sep/2021","schoolid":15919,"name":"KIAMUTURI SECONDARY SCHOOL","county":"Murang'a"},{"account_manager":"Maureen Waringa ","registration_date":"11/Nov/2021","schoolid":19904,"name":"RARAKWA GIRLS SECONDARY SCHOOL","county":"Murang'a"},{"account_manager":"Maureen Waringa ","registration_date":"08/Jan/2022","schoolid":23418,"name":"Kiriti Girls Secondary School","county":"Murang'a"},{"account_manager":"Brian Ndirangu","registration_date":"10/Jan/2022","schoolid":23492,"name":"Kieni Secondary School","county":"Nyandarua"},{"account_manager":"Vivian Deutsche","registration_date":"20/Jan/2022","schoolid":24044,"name":"St. Robert's Arwos Secondary school","county":"Nandi"},{"account_manager":"Maureen Waringa ","registration_date":"02/Feb/2022","schoolid":24395,"name":"Wahundura Mixed Secondary School","county":"Murang'a"}]};
	}

}
