import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { HotToastService } from "@ngneat/hot-toast";
import { DataService } from "../../../../@core/shared/services/data/data.service";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
interface Topic {
	topicId: number,
	topicName: string,
	numberOfCompetencies: number
}
@Component({
	selector: "app-subject-topics",
	templateUrl: "./subject-topics.component.html",
	styleUrls: ["../olevel-subjects/olevel-subjects.component.scss"]
})
export class SubjectTopicsComponent implements OnInit {
	topics: Topic[] = [];
	loading = false;

	subjectId!: number;
	subjectName = "";
	classLevels: number[] = [1, 2, 3, 4];
	selectedLevel = 1;
	levelName = "";
	newTopicForm = new FormGroup({
		topicName: new FormControl("", [Validators.required]),
		classLevel: new FormControl(this.selectedLevel, [Validators.required]),
	});
	selectedTopic!: Topic;

	constructor(private router: Router,
		private activatedRoute: ActivatedRoute,
		private classesService: ClassesService,
		private toastService: HotToastService,
		private dataService: DataService,
		private translate: TranslateService) {
	}

	ngOnInit(): void {
		this.subjectId = this.activatedRoute.snapshot.params.subjectId;

		this.dataService.schoolData.subscribe((schoolTypeData) => {
			if (schoolTypeData) {
				this.levelName = schoolTypeData.formoryear;
			}
		});

		this.getSubjectTopics();
	}

	get f(): { [key: string]: AbstractControl } {
		return this.newTopicForm.controls; 
	}

	viewCompetencies(topicId, name: string) {
		this.router.navigate(["/main/classes/olevel/subjects/topics/competencies", topicId], { queryParams: { topic: name, sId: this.subjectId } });
	}

	confirmDelete(topicId: number) {
		Swal.fire({
			title: "Delete Topic",
			text: "Are you sure you want to delete this topic? You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result.value) {
				this.deleteTopic(topicId);
			}
		});
	}

	private deleteTopic(topicId: number) {
		this.classesService.deleteSubjectTopic(topicId).subscribe((res) => {
			this.topics = this.topics.filter(topic => topic.topicId !== topicId);

			this.toastService.success(this.translate.instant("classes.manageSubject.topicDeleted"));
		}, (err) => {
			this.toastService.error(err.error.response.message);
		});
	}

	private getSubjectTopics() {
		this.loading = true;
		this.classesService.getSubjectTopics(this.subjectId, this.selectedLevel, null!, null!).subscribe((res) => {
			this.loading = false;
			this.subjectName = res.subjectName;
			this.topics = res.topics;
		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	submitted = false;
	addNewTopic() {
		this.submitted = true;
		if (this.newTopicForm.invalid) {
			return;
		}

		const topic = {
			topicName: this.f.topicName.value,
			classLevel: this.f.classLevel.value,
			subjectId: parseInt(this.subjectId + "")
		};

		const closeBtn = document.querySelector<HTMLButtonElement>(".modal-dismiss");

		if (this.selectedTopic) {
			this.saveEditedTopic(topic, closeBtn);
		} else {
			this.saveTopic(topic, closeBtn);
		}
	}

	saveTopic(topic, closeBtn) {
		this.classesService.addSubjectTopic(topic).subscribe((res) => {
			this.submitted = false;

			//Close modal
			if (closeBtn) {
				closeBtn.click();
			}

			this.newTopicForm.reset();
			this.toastService.success(this.translate.instant("classes.manageSubject.topicAdded"));
			this.getSubjectTopics();
		}, (err) => {
			this.submitted = false;
			this.toastService.error(err.error.message);
		});
	}

	saveEditedTopic(topic, closeBtn) {
		topic["topicId"] = this.selectedTopic.topicId;
		this.classesService.editSubjectTopic(topic).subscribe((res) => {
			this.submitted = false;

			//Close modal
			if (closeBtn) {
				closeBtn.click();
			}

			this.getSubjectTopics();

			this.newTopicForm.reset();
			this.toastService.success(this.translate.instant("classes.manageSubject.topicEdited"));
		}, (err) => {
			this.submitted = false;
			this.toastService.error(err.error.message);
		});
	}

	onLevelChange($event: any) {
		this.newTopicForm.patchValue({ classLevel: $event });
		this.getSubjectTopics();
	}

	editTopic(topic: Topic) {
		this.selectedTopic = topic;

		this.newTopicForm.setValue({
			topicName: topic.topicName,
			classLevel: this.selectedLevel
		});
		const openModalBtn = document.querySelector<HTMLButtonElement>(".open-modal");
		if (openModalBtn) {
			openModalBtn.click();
		}
	}

	closeModal() {
		this.selectedTopic = null!;
		this.newTopicForm.reset();

		const closeBtn = document.querySelector<HTMLButtonElement>(".modal-dismiss");
		if (closeBtn) {
			closeBtn.click();
		}
	}

	navigateBack() {
		this.router.navigate(["/main/classes/olevel/subjects"]);
	}
}
