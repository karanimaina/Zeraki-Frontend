import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {SchoolTypeData} from "../../../../@core/models/school-type-data";
import {Major} from "../../../../@core/models/major/major";
import {CoefficientSystem} from "../../../../@core/models/major/subject-weight-preset";
import {SubjectCoefficient} from "../../../../@core/models/major/subject-coefficient";
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";

@Component({
	selector: "app-coefficient-view",
	templateUrl: "./coefficient-view.component.html",
	styleUrls: ["./coefficient-view.component.scss"]
})
export class CoefficientViewComponent implements OnInit, OnChanges {

	@Input() schoolTypeData?: SchoolTypeData;
	@Input() majors: Major[] = [];
	@Input() coefficientSystem!: CoefficientSystem;
	@Input() subjectCoefficients: SubjectCoefficient[] = [];
	@Input() loadingMajors = true;
	@Input() loadingPresets = true;

	@Output() getSubjectWeightPresetsEvt: EventEmitter<any> = new EventEmitter<any>();
	@Output() saveSubjectWeightPresetChangesEvt: EventEmitter<any> = new EventEmitter<any>();

	selectedMajor!: Major;
	editCoefficientsForm: FormGroup = this.fb.group({
		coefficientRows: this.fb.array([])
	});
	updateMajorForm: FormGroup = this.fb.group({
		major: []
	});
	editableRows: number[] = [];
	savingRow: { [key: number]: boolean } = {};

	constructor(private fb: FormBuilder) {
	}

	ngOnInit(): void {
		this.watchChangesForMajor();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes) {
			//set default major
			if (changes.majors) {
				this.setDefaultMajor();
			}

			//initialize the form Array
			if (changes.coefficientSystem && changes.subjectCoefficients)
				this.initializeSubjectWeightPresetsForm();
		}
	}

	private watchChangesForMajor() {
		this.updateMajorForm.get("major")?.valueChanges.subscribe((selectedMajor: Major) => {
			if (selectedMajor) {
				this.selectedMajor = selectedMajor;
				this.getSubjectWeightPresets();
			}
		});
	}

	getSubjectWeightPresets() {
		this.getSubjectWeightPresetsEvt.emit(this.selectedMajor?.majorId);
	}

	private setDefaultMajor() {
		this.updateMajorForm.patchValue({
			major: this.majors[0]
		});
		this.selectedMajor = this.majors[0];
	}

	private get subjectWeightPresetFormArray() {
		return this.editCoefficientsForm.get("coefficientRows") as FormArray;
	}

	private initializeSubjectWeightPresetsForm() {
		this.subjectWeightPresetFormArray.clear();

		for (const subjectCoefficient of this.subjectCoefficients) {
			this.subjectWeightPresetFormArray.push(
				this.fb.group({
					subjectId: subjectCoefficient.subjectId,
					majorId: subjectCoefficient.majorId,
					weights: this.fb.array(this.initializeWeightsFormArray(subjectCoefficient))
				})
			);
		}
	}

	private initializeWeightsFormArray(subjectCoefficient: SubjectCoefficient) {
		return this.coefficientSystem.forms.map((form) => {
			return this.fb.group({
				form: form.form,
				weight: subjectCoefficient.classWeight[form.form]
			});
		});
	}


	editRow(subject: number) {
		if (this.editableRows.includes(subject)) {
			this.editableRows = this.editableRows.filter(s => s !== subject);
		} else {
			this.editableRows.push(subject);
		}
	}

	saveSubjectWeightPresetChanges(subjectCoefficient: SubjectCoefficient, presetIndex: number) {
		const form: FormGroup = this.subjectWeightPresetFormArray.controls[presetIndex] as FormGroup;
		this.toggleSavingRowStatus(subjectCoefficient, true);
		const event = {
			form: form,
			subjectCoefficient: subjectCoefficient
		};
		this.saveSubjectWeightPresetChangesEvt.emit(event);
	}

	toggleSavingRowStatus(subjectCoefficient: SubjectCoefficient, status: boolean) {
		this.savingRow[subjectCoefficient.subjectId] = status;
	}


	effectChanges(subjectCoefficient, updatedValues) {
		this.savingRow[subjectCoefficient.subjectId] = false;
		this.editableRows = this.editableRows.filter(row => row != subjectCoefficient.subjectId);
		this.coefficientSystem.forms.forEach((form) => {
			subjectCoefficient.classWeight[form.form] =
				updatedValues.weights.find((weight: any) => weight.form == form.form).weight;
		});
	}

}
