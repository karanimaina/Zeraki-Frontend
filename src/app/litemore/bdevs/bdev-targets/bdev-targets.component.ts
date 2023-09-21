import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";

@Component({
	selector: "app-bdev-targets",
	templateUrl: "./bdev-targets.component.html",
	styleUrls: ["./bdev-targets.component.scss"]
})
export class BdevTargetsComponent implements OnInit {

	item: any = {};
	current_target_period:any = null;
	target_periods:any;
	target_fulfilments: any;
	new_target_period:any= {};
	error_msg_reset: any;

	constructor(private bdevService:BdevService, private toastService:HotToastService) { }

	ngOnInit(): void {
		this.getTargetPeriods();
		this.item.create_target_period = false;
		this.item.sortType = "percentage_fulfilled_schools";
		this.item.sortReverse = false;
	}

 
	getTargetPeriods  () {
		this.bdevService.doGet("/team/bdev_target_periods").subscribe( (resp) =>{
			this.target_periods = resp;
			if (this.target_periods != null && this.target_periods.periods != null && this.target_periods.periods.length > 0) {
				this.current_target_period = this.target_periods.periods[0];
				this.getTargetFulfilments();
			}
		});
	}
 
	getTargetFulfilments() {
		if (this.current_target_period != null && this.current_target_period.periodid > 0) {
			this.target_fulfilments = null;
			this.bdevService.doGet("/team/bdev_target_fulfilments/" + this.current_target_period.periodid).subscribe( (resp)=> {
				this.target_fulfilments = resp;
			});
		}
	}
	initCreateTargetPeriod (status) {
		this.item.start_date_open = false;
		this.item.end_date_open = false;
		this.new_target_period = {};
		this.item.create_target_period = status;
	}
	saveTargetPeriod(form:NgForm) {
		if(form.invalid) {
			return;
		}
		const startTime=new Date(form.value.dateStart).getTime();
		const endTime=new Date(form.value.dateEnd).getTime();
		// var params = "?start_date=" + this.new_target_period.start_date.getTime() + "&end_date=" + this.new_target_period.end_date.getTime();
		const params = "?start_date=" + startTime + "&end_date=" + endTime;
		// console.table(form.value)
		this.bdevService.doPostNoParams("/team/bdev_target_periods" + params).subscribe((resp)=> {
			this.getTargetPeriods();
			this.item.create_target_period = false;
		}, (resp) => {
			if (resp.error.message === undefined) {
				this.error_msg_reset = "An error occured.";
			} else {
				this.error_msg_reset = resp.error.message;
			}
			this.toastService.warning(this.error_msg_reset);
		});
	}
	showDatePicker ($event, item) {
		$event.preventDefault();
		$event.stopPropagation();
		if (item == 1) {
			this.item.start_date_open = true;
			this.item.end_date_open = false;
		} else if (item == 2) {
			this.item.start_date_open = false;
			this.item.end_date_open = true;
		}
	}

	initEditFulfilment (f) {
		f.expected_schools_temp = f.expected_schools;
		f.expected_revenue_temp = f.expected_revenue;
		f.edit = true;
	}

	saveTargetChanges (f) {
		if (f != null && f.fulfilmentid > 0) {
			this.bdevService.doPostWithParams("/team/bdev_target_fulfilments",f).subscribe( (resp) => {
				this.toastService.success(resp?.message);
				let percentage = 0;
				if (f.expected_schools_temp != f.expected_schools) {
					if (f.expected_schools_temp > 0) {
						percentage = (f.fulfilled_schools / f.expected_schools_temp) * 100.0;
					}
					f.percentage_fulfilled_schools = percentage;
					f.expected_schools = f.expected_schools_temp;
				}
				if (f.expected_revenue_temp != f.expected_revenue) {
					if (f.expected_revenue_temp > 0) {
						percentage = (f.fulfilled_revenue / f.expected_revenue_temp) * 100.0;
					}
					f.percentage_fulfilled_revenue = percentage;
					f.expected_revenue = f.expected_revenue_temp;
				}

				f.edit = false;
			}, (resp)=> {
				if (resp.error.message === undefined) {
					this.error_msg_reset = "An error occured.";
				} else {
					this.error_msg_reset = resp.data.message;
				}
				this.toastService.warning(this.error_msg_reset);
			});
		}
	}

	sortBySigned() {

		/**
     * toggle:true=>sort from high to low
     * toggle:false=>sort from low to high
     */
		if(this.item.sortReverse) {
			this.target_fulfilments.fulfilments.sort( (a, b)=> {
				return a[this.item.sortType] - b[this.item.sortType];
			});
		} else {
			// sort by percentage_fulfilled_schools
			this.target_fulfilments.fulfilments.sort( (a, b) =>{
				return b[this.item.sortType] - a[this.item.sortType];
			});
     
		} 
	}
}
