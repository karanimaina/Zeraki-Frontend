import {Component, Input, OnInit} from "@angular/core";
import {ReportFormIdentifiers} from "../../../../../../@core/models/evaluation/report-form-identifiers";

@Component({
	selector: "app-score-range-identifiers",
	templateUrl: "./score-range-identifiers.component.html"
})
export class ScoreRangeIdentifiersComponent implements OnInit {

	@Input() reportFormIdentifiers!: ReportFormIdentifiers;
	constructor() { }

	ngOnInit(): void {
	}

}
