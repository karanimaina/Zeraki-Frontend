import { Component, OnInit } from "@angular/core";
import Swal from "sweetalert2";
import { SubjectTopic, TopicCompetency } from "../../../../@core/models/classes/subject-with-topics";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-topic-competencies",
	templateUrl: "./topic-competencies.component.html",
	styleUrls: ["../olevel-subjects/olevel-subjects.component.scss"]
})
export class TopicCompetenciesComponent implements OnInit {
	subjectId!: number;
	topicId!: number;
	topicName = "";
	topic!: SubjectTopic;
	competencies: TopicCompetency[] = [];
	newCompetencyForm: FormGroup = new FormGroup({
		name: new FormControl("", [Validators.required]),
	});
	selectedCompetency!: TopicCompetency;

	constructor(private activatedRoute: ActivatedRoute,
		private classesService: ClassesService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router) { }

	ngOnInit(): void {
		this.topicId = this.activatedRoute.snapshot.params.topicId;
		this.subjectId = this.activatedRoute.snapshot.queryParams.sId;
		this.topicName = this.activatedRoute.snapshot.queryParams.topic;

		this.getSubjectTopic();
	}

	get f(): { [key: string]: AbstractControl } {
		return this.newCompetencyForm.controls; 
	}

	confirmDelete(competencyId: number) {
		Swal.fire({
			title: "Delete Competency Area",
			text: "Are you sure you want to delete this competency area? You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result.value) {
				this.deleteCompetencyArea(competencyId);
			}
		});
	}

	private deleteCompetencyArea(competencyId: number) {
		this.classesService.deleteCompetencyArea(competencyId).subscribe((res) => {
			this.competencies = this.competencies.filter(competency => competency.competencyAreaId !== competencyId);

			this.toastService.success(this.translate.instant("classes.manageSubject.competencyDeleted"));
		});
	}

	private getSubjectTopic() {
		this.classesService.getTopicCompetencies(this.topicId).subscribe((res) => {
			this.competencies = res;
		});
	}

	submitted = false;
	addNewCompetency() {
		this.submitted = true;
		if (this.newCompetencyForm.invalid) {
			return;
		}

		const competency = {
			name: this.f.name.value,
			topicId: parseInt(this.topicId.toString())
		};

		const closeBtn = document.querySelector<HTMLButtonElement>(".modal-dismiss");

		if (this.selectedCompetency) {
			competency["competencyId"] = this.selectedCompetency.competencyAreaId;
			this.saveEditedCompetency(competency, closeBtn);

		} else {
			this.saveCompetency(competency, closeBtn);
		}

	}

	saveCompetency(competency, closeBtn) {
		this.classesService.addCompetencyArea(competency).subscribe((res) => {
			if (closeBtn) {
				closeBtn.click();
			}
			this.getSubjectTopic();
			this.newCompetencyForm.reset();
			this.toastService.success(this.translate.instant("classes.manageSubject.competencyAdded"));
		}, (err) => {
			console.log(err);
			this.toastService.error(err.error.response.message);
		});
	}

	saveEditedCompetency(competency, closeBtn) {
		this.classesService.editCompetencyArea(competency).subscribe((res) => {
			if (closeBtn) {
				closeBtn.click();
			}
			this.topic.competencies.forEach(c => {
				if (c.competencyAreaId === competency.competencyId) {
					c.name = competency.name;
				}
			});

			this.newCompetencyForm.reset();
			this.toastService.success(this.translate.instant("classes.manageSubject.competencyUpdated"));
		}, (err) => {
			console.log(err);
			this.toastService.error(err.error.response.message);
		});
	}

	editCompetency(competency: TopicCompetency) {
		this.selectedCompetency = competency;
		this.newCompetencyForm.setValue({
			name: competency.name
		});

		const openModalBtn = document.querySelector<HTMLButtonElement>(".open-modal");
		if (openModalBtn) {
			openModalBtn.click();
		}
	}

	closeModal() {
		this.selectedCompetency = null!;
		this.newCompetencyForm.reset();
		this.submitted = false;

		const closeBtn = document.querySelector<HTMLButtonElement>(".modal-dismiss");
		if (closeBtn) {
			closeBtn.click();
		}
	}

	navigateBack() {
		this.router.navigate(["/main/classes/olevel/subjects/topics", this.subjectId]);
	}
}
