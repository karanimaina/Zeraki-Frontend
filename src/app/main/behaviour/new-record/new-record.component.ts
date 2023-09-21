import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { BehaviourService } from "src/app/@core/services/behaviour/behaviour.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-new-record",
	templateUrl: "./new-record.component.html",
	styleUrls: ["./new-record.component.scss"]
})
export class NewRecordComponent implements OnInit {

	@ViewChild("addForm") addForm: any;

	streams: any = {};
	students: any = {};
	infractions: any = {};
	merits: any = {};
	claires: any = {};
	leadershipPosition: any = {};




	intakeForm!: FormGroup;
	studentForm!: FormGroup;
	behaviourForm: any = {};

	isInfraction = true;
	isRecentRecord = false;
	isLeadershipPosition = false;
	isClaire = false;
	type: any = "1";

	//selected values
	selectedInfraction: any = {};
	selectedClaire: any = {};
	selectedIntake: any = "";
	selectedStudents: any[] = [];

	constructor(
		private bService: BehaviourService,
		private toastService: HotToastService,
		private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.loadStreams();
		this.loadInfractions();

		this.merits = this.bService.getMerits();
		this.claires = this.bService.getClaire();
		this.leadershipPosition = this.bService.getLeadershipPosition();

		this.initForm();
	}

	infractionClick() {
		this.isInfraction = true;
		this.isRecentRecord = false;
		this.isLeadershipPosition = false;
		this.isClaire = false;
	}

	loadStreams() {
		this.bService.getBehaviourStreams().subscribe((res) => {
			this.streams = res;
		}, (err) => {
			console.log(err);
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	loadInfractions() {
		this.bService.getInfractions().subscribe((res) => {
			this.infractions = res;
		}, (err) => {
			console.log(err);
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	infactionSelectChange() {

	}


	loadMerits() {

	}

	loadClaires() {

	}

	loadLeadershipPositions() {

	}

	loadStudents(intake: any) {
		this.bService.getStreamStudents(intake).subscribe((res) => {
			this.students = res;
		}, (err) => {
			console.log(err);
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	recentRecordClick() {
		this.addForm.submitted = false;
		this.isInfraction = false;
		this.isRecentRecord = true;
		this.isLeadershipPosition = false;
		this.isClaire = false;
	}

	leadershipClick() {
		this.addForm.submitted = false;
		this.isInfraction = false;
		this.isRecentRecord = false;
		this.isLeadershipPosition = true;
		this.isClaire = false;
	}

	claireClick() {
		this.addForm.submitted = false;
		this.isInfraction = false;
		this.isRecentRecord = false;
		this.isLeadershipPosition = false;
		this.isClaire = true;
	}

	initForm() {
		this.intakeForm = new FormGroup({
			intake: new FormControl("", [Validators.required])
		});

		this.studentForm = new FormGroup({
			student: new FormControl([], [Validators.required])
		});

		// this.behaviourForm = new FormGroup({
		//   infractionLevel: new FormControl(""),
		//   infraction: new FormControl(""),
		//   merit: new FormControl(""),
		//   comment: new FormControl(""),
		//   claireValue: new FormControl(""),
		//   claireItem: new FormControl("")

		// })
		this.behaviourForm = {
			infractionLevel: "",
			infraction: "",
			merit: "",
			comment: "",
			claireValue: "",
			claireItem: "",
			leadershipPosition: ""
		};
	}

	selectInfraction() {
		const i = this.behaviourForm.infractionLevel;
		i == "" ? this.selectedInfraction = {} : this.selectedInfraction = this.infractions.list[i];

	}

	selectClaire() {
		const i = this.behaviourForm.claireValue;
		i == "" ? this.selectedClaire = {} : this.selectedClaire = this.claires.list[i];

	}

	intakeChange() {
		(this.selectedIntake != "") ? this.loadStudents(this.selectedIntake) : this.students = {};
	}

	saveNewRecord() {
		//check of whit type is selected
		if (this.addForm.valid) {
			const post: any = {
				students: this.selectedStudents,
				type: parseInt(this.type),
				comment: this.behaviourForm.comment
			};
			//set infraction
			if (this.isInfraction) {
				post.infraction_itemid = this.behaviourForm.infraction;
			}
			//set positive behaviour
			if (this.isRecentRecord) {
				post.positive_behaviour_meritid = this.behaviourForm.merit;
			}
			//set leadership position
			if (this.isLeadershipPosition) {
				post.leadership_position_meritid = this.behaviourForm.leadershipPosition;
			}

			//set claire
			if (this.isClaire) {
				post.claire_itemid = this.behaviourForm.claireValue;
			}

			//do post here
			Swal.fire({
				title: this.translate.instant("behaviour.newRecord.swal.title"),
				text: this.translate.instant("behaviour.newRecord.swal.text"),
				icon: "question",
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
				showCancelButton: true,
			}).then((isConfirm) => {
				if (isConfirm.isConfirmed) {
					this.bService.addBehaviourRecord(post).subscribe(
						(res) => {
							console.log(res.message);

							const message = this.translate.instant("behaviour.newRecord.toastMessages.saveSuccess");
							this.toastService.success(message);
						}, (err) => {
							const message = this.translate.instant("common.toastMessages.anErrorOccurred");
							this.toastService.error(message);
						}
					);
				}

			});
		}

	}

}
