import {Component, Input} from "@angular/core";

@Component({
	selector: "app-sweet-alert-content",
	template: `
		<div class="fs-14">
			{{ "evaluation.all.swal.text2" | translate }}
		</div>
		<div class="mt-2">
			{{ "evaluation.all.swal.text3" | translate }} 
			<strong>{{ assessmentName}}</strong>
		</div>
		
		<div>
			<input [placeholder]="'evaluation.all.swal.inputPlaceholder' | translate" [(ngModel)]="nameInput" id="swal-input1" class="swal2-input" style="width: 80%">
		</div>
		
		<div class="form-check mt-4" *ngIf="nextAssessmentName">
			<input [(ngModel)]="nameCheckbox" class="form-check-input" type="checkbox" value="" id="checkbox1">
			<label class="form-check-label" for="checkbox1">
				<b>{{nextAssessmentName}}</b> 
				{{ "evaluation.all.swal.checkboxLabel" | translate }} 
				<b>{{ assessmentName}}</b> <br/>
				{{ "evaluation.all.swal.checkboxLabel2" | translate }}
			</label>
		</div>`
})

export class SweetAlertContentComponent {
	@Input() assessmentName!: string;
	@Input() nextAssessmentName!: string;

	nameInput!: string;
	nameCheckbox!: boolean;
}
