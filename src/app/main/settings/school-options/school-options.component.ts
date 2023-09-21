import { Component, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import {OptionGroup} from "../../../@core/models/settings/school-options/option-group";
import {Choice} from "../../../@core/models/settings/school-options/choice";
import {SchoolOption} from "../../../@core/models/settings/school-options/school-option";
import { SettingsService } from "src/app/@core/services/settings/settings.service";

@Component({
	selector: "app-school-options",
	templateUrl: "./school-options.component.html",
	styleUrls: ["./school-options.component.scss"]
})
export class SchoolOptionsComponent implements OnInit {
	optionGroups: OptionGroup[] = [];

	constructor(
		private settingService: SettingsService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.getSchoolOptionsSubject();
	}

	getSchoolOptionsSubject() {
		this.settingService.getSchoolOptionsSubject().subscribe((optionGroups) => {
			if (optionGroups) {
				this.optionGroups = optionGroups;
			} else {
				this.settingService.setSchoolOptions();
			}
			
		});
	}

	onChoiceChange(option: SchoolOption) {

		const url = "groups/school/options?id=" + option.id + "&value=" + option.value;
		if (option?.warningMessage) {
			Swal.fire({
				title: option.warningTitle,
				text: option.warningMessage,
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo")
			}).then((result) => {
				if (result.isConfirmed) {
					this.processChange(url);
				}
			});
		} else {
			this.processChange(url);
		}
	}

	processChange(url: string) {
		this.dataService.send(null, url).subscribe({
			next: () => {
				const message = this.translate.instant("settings.schoolInfoOptions.toastMessages.processChangeSuccess");
				this.settingService.setSchoolOptions();
				this.dataService.setSchoolTypeData();
				this.toastService.success(message);
			},
			error: err => {
				if (err.status == 422) {
					this.toastService.error(err.error[0].title);
				}else {
					this.toastService.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
				}
			}
		});
	}

	choiceHasTextAndValue(choices: Array<number[] | Choice[]>) {
		return choices.length > 0 && !this.isNumber(choices[0]);
	}

	isNumber(num: any) {
		return (typeof num == "string" || typeof num == "number") && !isNaN(Number(num)) && num !== "";
	}
}
