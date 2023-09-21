import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Evaluation } from "../../../../@core/models/evaluation/evaluation-list";

@Component({
	selector: "app-single-evaluation",
	templateUrl: "./single-evaluation.component.html",
	styleUrls: ["./single-evaluation.component.scss"]
})
export class SingleEvaluationComponent implements OnInit {
	@Input() evaluation!: Evaluation;
	@Input() evaluationTitle = "";
	@Input() term: any;
	@Input() classId!: number;
	@Input() streamId!: number;
	@Input() isLastAssessment!: boolean;
	@Input() evaluationIndex!: number;
	@Input() assessmentType!: string;
	@Output() onDeleteEvaluation: EventEmitter<{ term: any, evaluationId: number }> = new EventEmitter<{ term: any, evaluationId: number }>();
	@Output() onDeleteWithVerification: EventEmitter<{ term: any, evaluation: Evaluation, index: number }> = new EventEmitter<{ term: any, evaluation: Evaluation, index: number }>();

	constructor() { }

	ngOnInit(): void {
	}

	confirmDelete(term: any, evaluationId: number) {
		this.onDeleteEvaluation.emit({ term, evaluationId });
	}

	confirmDeleteWithVerification(term: any, evaluation: Evaluation) {
		this.onDeleteWithVerification.emit({ term, evaluation, index: this.evaluationIndex });
	}

	get assessmentId() {
		switch (this.assessmentType) {
		case "project":
			return this.evaluation.projectId;
		default:
			return this.evaluation.evaluationId;
		}
	}

	get getAssessmentType() {
		switch (this.assessmentType) {
		case "exam":
			return "Exam";
		case "evaluation":
			return "Evaluation";
		case "project":
			return "Project";
		default:
			return "";
		}
	}
}
