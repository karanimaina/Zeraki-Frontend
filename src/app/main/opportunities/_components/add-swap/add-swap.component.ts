import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Swap } from "src/app/@core/models/swap";
import { VacancyService } from "src/app/@core/services/vacancy/vacancy.service";

@Component({
	selector: "app-add-swap",
	templateUrl: "./add-swap.component.html",
	styleUrls: ["./add-swap.component.scss"]
})
export class AddSwapComponent implements OnInit {
	@Input() swap!: Swap;
	@Input() regionFrom: any = {};
	@Input() regionTo: any = {};
	@Input() counties: any[] = [];
	@Input() categories: any[] = [];
	@Input() categories_optionals: any[] = [];
	@Input() categories_technicals: any[] = [];
	@Input() counter: any;
	@Input() allsubjects: any[] = [];

	@Output() OcloseSwap: EventEmitter<boolean> = new EventEmitter();
	@Output() OgetSwap: EventEmitter<number> = new EventEmitter();
	@Output() OgetSubCounties: EventEmitter<{countyid: number, from: boolean}> = new EventEmitter();

	isLinear = true;


	constructor(
		private vacancyService: VacancyService,
		private translate: TranslateService,
		private toastService: HotToastService
	) { }

	ngOnInit(): void {}

	closeSwapCreate() {
		this.OcloseSwap.emit();
	}

	saveSwap() {
		const subCountyFrom: any = this.swap.subcountyFrom;
		const countyTo: any = this.swap.countyTo;
		const subcountyTo: any = this.swap.subcountyTo;

		let mainSubjects: any[] = [];
		for (let sub = 0; sub < this.allsubjects.length; sub++) {
			if (this.allsubjects[sub].selected) {
				mainSubjects = [...mainSubjects, this.allsubjects[sub]];
			}
		}
		this.swap.subject1Name = mainSubjects[0].name;
		this.swap.subject1Id = mainSubjects[0].subjectId;
		this.swap.subject2Name = mainSubjects[1].name;
		this.swap.subject2Id = mainSubjects[1].subjectId;

		if (this.swap.swapId == null) {
			const swapObj = {
				countyToId: countyTo.countyid,
				subCountyFromId: subCountyFrom.subCountyId,
				subCountyToId: subcountyTo.subCountyId,
				subject1Id: this.swap.subject1Id,
				subject2Id: this.swap.subject2Id,
				displayUploaderContact: this.swap.displayUploaderContact
			};

			this.vacancyService.saveSwap(swapObj).subscribe({
				next: (resp: any) => {

					const message = this.translate.instant("opportunities.swap.toastMessages.saveSuccess");
					this.toastService.success(message);

					this.OgetSwap.emit(1);
					for (let sub = 0; sub < this.allsubjects.length; sub++) {
						this.allsubjects[sub].selected = false;
						this.counter = 0;
					}

				},
				error: err => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.error(message);
				}
			});
		} else {
			const updateObj = {
				swapId: this.swap.swapId,
				countyToId: countyTo.countyid,
				subCountyFromId: subCountyFrom.subCountyId,
				subCountyToId: subcountyTo.subCountyId,
				subject1Id: this.swap.subject1Id,
				subject2Id: this.swap.subject2Id,
				displayUploaderContact: this.swap.displayUploaderContact
			};

			this.vacancyService.updateSwap(updateObj).subscribe({
				next: (resp: any) => {
					const message = this.translate.instant("opportunities.swap.toastMessages.updateSuccess");
					this.toastService.success(message);

					this.OgetSwap.emit(1);
					for (let sub = 0; sub < this.allsubjects.length; sub++) {
						this.allsubjects[sub].selected = false;
					}
					this.counter = 0;
				},
				error: err => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.error(message);
				}
			});
		}
	}

	countyChanged() {
		this.regionTo.county = this.swap.countyTo;
		this.swap.subcountyTo = "";
		this.OgetSubCounties.emit({countyid: this.regionTo.county.countyid, from: false});
	}

	setSelectValue(subject: any) {
		subject.selected = !subject.selected;
		if (subject.selected == true) {
			if (this.counter < 2) {
				this.counter++;
			} else {
				this.counter = 2;
			}
		} else if (subject.selected == false) {
			if (this.counter > 0) {
				this.counter--;
			} else {
				this.counter = 0;
			}
		}
	}



}
