import { Component, OnInit, ViewChild } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { BehaviourService } from "src/app/@core/services/behaviour/behaviour.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-manage-behaviour",
	templateUrl: "./manage-behaviour.component.html",
	styleUrls: ["./manage-behaviour.component.scss"]
})
export class ManageBehaviourComponent implements OnInit {

	@ViewChild("infractionForm") infractionForm: any;


	//--logic params
	isInfraction = true;
	isInfractionItem = false;
	isAddInfractionItem = false;
	isMerit = false;
	isLeadershipPosition = false;
	isClaire = false;

	addInfraction = false;
	addMerit = false;
	addLeadership = false;
	addClaire = false;

	addInfractionForm: any = {};
	addInfractionItemForm: any = {};
	addMeritForm: any = {};
	addLeadershipForm: any = {};

	//--load data
	bFrequency: any;
	bInfractions: any;
	bMerits: any;
	bLeadership: any;
	bClaire: any;

	infractionsLoad = 0;
	meritLoad = 0;
	leadershipLoad = 0;
	claireLoad = 0;

	selectedInfraction: any = {};

	fMap = new Map();
	infractionLoading = false;

	constructor(
		private bService: BehaviourService,
		private toastService: HotToastService,
		private translate: TranslateService,
	) { }

	initForms() {
		this.addInfractionForm = {
			level: null,
			description: null,
			points: null
		};
		this.addInfractionItemForm = {
			action: null,
			description: null
		};
		this.addMeritForm = {
			award: null,
			description: null,
			points: null,
			frequencyid: ""
		};
		this.addLeadershipForm = {
			award: null,
			description: null,
			points: null,
			frequencyid: ""
		};
	}

	ngOnInit(): void {
		this.bInfractions = this.bService.getManageBehaviourInfractions();
		this.loadFrequency();
		this.loadInfractions();
		this.initForms();
	}


	loadInfractions() {
		this.bService.getManageBehaviourInfractions().subscribe(
			(res) => {
				this.bInfractions = res;
				this.infractionsLoad++;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	loadFrequency() {
		this.bService.getManageBehaviourFrequency().subscribe(
			(res) => {
				this.bFrequency = res;
				this.initData();
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	loadMerit() {
		this.bService.getMerits().subscribe(
			(res) => {
				this.bMerits = res;
				this.initData();
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	loadLeadershipPosition() {
		this.bService.getLeadershipPosition().subscribe(
			(res) => {
				this.bLeadership = res;
			}
		);
	}

	loadClaire() {
		this.bService.getClaire().subscribe(
			(res) => {
				this.bClaire = res;
			}
		);
	}

	addNewInfraction() {
		if (this.infractionForm.valid) {
			const infractions: any = [];
			infractions.push(this.addInfractionForm);
			this.bService.addInfraction(infractions).subscribe(
				(res) => {
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.addInfractionSuccess");
					this.toastService.success(message);

					this.loadInfractions();
				}, (err) => {
					console.log(err.error.message);

					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}
			);
		}
	}

	initEditInfraction(infraction: any) {
		infraction.level_temp = infraction.level;
		infraction.description_temp = infraction.description;
		infraction.points_temp = infraction.points;
		infraction.edit = true;
	}

	@ViewChild("descriptionEdit") descriptionEdit: any;
	@ViewChild("levelEdit") levelEdit: any;
	@ViewChild("pointsEdit") pointsEdit: any;

	updateInfraction(infraction: any) {
		if (this.descriptionEdit.valid && this.levelEdit.valid && this.pointsEdit.valid) {
			const obj: any = {
				description: infraction.description_temp,
				infractionid: infraction.infractionid,
				level: infraction.level_temp,
				points: infraction.points_temp
			};
			this.bService.updateInfraction(obj).subscribe(
				(res) => {
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.updateInfractionSuccess");
					this.toastService.success(message);

					infraction.level = infraction.level_temp;
					infraction.description = infraction.description_temp;
					infraction.points = infraction.points_temp;
				}, (err) => {
					console.log(err.error.message);

					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}, () => {
					infraction.edit = false;
				});
		}
	}

	deleteInfraction(infraction: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.manageBehaviour.swal.titleDeleteInfraction"),
			text: this.translate.instant("behaviour.manageBehaviour.swal.textDeleteInfraction", { description: infraction.description }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteInfraction(infraction.infractionid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.deleteInfractionSuccess");
						this.toastService.success(message);

						this.bInfractions.list.splice(index, 1);
					}, (err) => {
						console.log(err.error.message);

						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.warning(message);
					}, () => {
					});

			}
		});
	}

	@ViewChild("infractionItemForm") infractionItemForm: any;
	addNewInfractionItem() {
		if (this.infractionItemForm.valid) {
			const infractionItems: any = [];
			infractionItems.push(this.addInfractionItemForm);
			this.bService.addInfractionItem(infractionItems, this.selectedInfraction.infractionid).subscribe(
				(res) => {
					// console.log(res)
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.addInfractionItemSuccess");
					this.toastService.success(message);

					this.viewInfractionItem(this.selectedInfraction);
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}
			);
		}
	}
	//--------------------
	initEditInfractionItem(infractionItem: any) {
		infractionItem.description_temp = infractionItem.description;
		infractionItem.action_temp = infractionItem.action;
		infractionItem.edit = true;
	}
	@ViewChild("desIName") desIName: any;
	@ViewChild("actName") actName: any;

	updateInfractionItem(infractionItem: any) {
		if (this.desIName.valid && this.actName.valid) {
			const obj: any = {
				description: infractionItem.description_temp,
				action: infractionItem.action_temp,
				itemid: infractionItem.itemid
			};
			this.bService.updateInfractionItem(obj).subscribe(
				(res) => {
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.updateInfractionItemSuccess");
					this.toastService.success(message);

					infractionItem.action = infractionItem.action_temp;
					infractionItem.description = infractionItem.description_temp;
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}, () => {
					infractionItem.edit = false;
				});
		}
	}

	deleteInfractionItem(infraction: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.manageBehaviour.swal.titleDeleteInfractionItem"),
			text: this.translate.instant("behaviour.manageBehaviour.swal.textDeleteInfractionItem", { description: infraction.description }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteInfractionItem(infraction.itemid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.deleteInfractionItemSuccess");
						this.toastService.success(message);

						this.selectedInfraction.items.list.splice(index, 1);
					}, (err) => {
						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.warning(message);
					}, () => {
					});

			}
		});
	}

	initData() {
		for (let i = 0; i < this.bFrequency.list.length; i++) {
			const e = this.bFrequency.list[i];
			this.fMap.set(e.frequencyid, e);
		}
	}

	viewInfractionItem(infraction: any) {
		this.infractionLoading = true;
		this.selectedInfraction = infraction;
		this.bService.getInfractionItems(infraction.infractionid).subscribe(
			(res) => {
				this.selectedInfraction.items = res;
				this.isInfractionItem = true;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}, () => {
				this.infractionLoading = false;
			}
		);
	}

	//---------------------------
	//SECTION MERIT
	//---------------------------
	toggleAddMerit() {
		this.addMerit = !this.addMerit;
	}
	@ViewChild("createMeritForm") createMeritForm: any;
	addNewMerit() {
		if (this.createMeritForm.valid) {
			const array: any = [];
			array.push(this.addMeritForm);
			this.bService.addMerit(array).subscribe(
				(res) => {
					// console.log(res)
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.addMeritSuccess");
					this.toastService.success(message);

					this.loadMerit();
					this.createMeritForm.resetForm();
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}
			);
		}
	}

	initMeritEdit(merit: any) {
		merit.description_temp = merit.description;
		merit.points_temp = merit.points;
		merit.award_temp = merit.award;
		merit.frequencyid_temp = merit.frequencyid;
		merit.edit = true;
		this.meritEditing = true;
	}

	@ViewChild("mDesEdit") mDesEdit: any;
	@ViewChild("mPointsEdit") mPointsEdit: any;
	@ViewChild("mFreqEdit") mFreqEdit: any;
	@ViewChild("mAwardsEdit") mAwardsEdit: any;
	meritEditing = false;
	updateMerit(merit: any) {
		if (this.mDesEdit.valid && this.mPointsEdit.valid && this.mFreqEdit.valid && this.mAwardsEdit.valid) {


			const obj: any = {
				description: merit.description_temp,
				award: merit.award_temp,
				frequencyid: parseInt(merit.frequencyid_temp),
				frequencyname: this.getFrequency(merit.frequencyid_temp).frequencyname,
				meritid: merit.meritid,
				points: merit.points_temp
			};



			this.bService.updateMerit(obj).subscribe(
				(res) => {
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.updateMeritSuccess");
					this.toastService.success(message);

					merit.points = merit.points_temp;
					merit.award = merit.award_temp;
					merit.frequencyid = merit.frequencyid_temp;
					merit.frequencyname = this.getFrequency(merit.frequencyid_temp).frequencyname;
					merit.description = merit.description_temp;

				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}, () => {
					merit.edit = false;
					this.meritEditing = false;
				});


		}

	}

	deleteMerit(merit: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.manageBehaviour.swal.titleDeleteMerit"),
			text: this.translate.instant("behaviour.manageBehaviour.swal.textDeleteMerit", { description: merit.description }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteMerit(merit.meritid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.deleteMeritSuccess");
						this.toastService.success(message);

						this.bMerits.list.splice(index, 1);
					}, (err) => {
						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.warning(message);
					}, () => {
					});
			}
		});
	}

	//---------------------------
	//SECTION LEADERSHIP POSITION
	//---------------------------
	toggleAddLeadership() {
		this.addLeadership = !this.addLeadership;
	}

	@ViewChild("createLeadershipForm") createLeadershipForm: any;
	addNewLeadership() {
		if (this.createLeadershipForm.valid) {
			const array: any = [];
			array.push(this.addLeadershipForm);
			this.bService.addLeaderhip(array).subscribe(
				(res) => {
					// console.log(res)
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.addLeadershipSuccess");
					this.toastService.success(message);

					this.loadLeadershipPosition();
					this.createLeadershipForm.resetForm();
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}
			);
		}
	}

	deleteLeadership(merit: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.manageBehaviour.swal.titleDeleteLeadership"),
			text: this.translate.instant("behaviour.manageBehaviour.swal.textDeleteLeadership", { description: merit.description }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteMerit(merit.meritid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.deleteLeadershipSuccess");
						this.toastService.success(message);

						this.bLeadership.list.splice(index, 1);
					}, (err) => {
						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.warning(message);
					}, () => {
					});
			}
		});
	}

	//---------------------------
	// SECTION CLAIRE
	//---------------------------
	addClaireForm: any = {
		description: null,
		points: null
	};
	toggleAddClaire() {
		this.addClaire = !this.addClaire;
	}
	@ViewChild("createClaireForm") createClaireForm: any;
	addNewClaire() {
		if (this.createClaireForm.valid) {
			const array: any = [];
			array.push(this.addClaireForm);
			this.bService.addClaire(array).subscribe(
				(res) => {
					// console.log(res)
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.addClaireSuccess");
					this.toastService.success(message);

					this.loadClaire();
					this.createClaireForm.resetForm();
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}
			);
		}
	}

	initEditClaire(claire: any) {
		claire.description_temp = claire.description;
		claire.points_temp = claire.points;
		claire.edit = true;
	}

	selectedClaire: any = {};
	claireLoading = false;
	isClaireItem = false;
	isAddClaireItem = false;
	newClaireItem: any = {
		description: null
	};
	viewClaireItem(claire: any) {
		this.claireLoading = true;
		this.selectedClaire = claire;
		this.bService.getClaireItems(claire.claireid).subscribe(
			(res) => {
				this.selectedClaire.items = res;
				this.isClaireItem = true;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}, () => {
				this.claireLoading = false;
			}
		);
	}

	@ViewChild("titleEdit") titleEdit: any;
	@ViewChild("cPointsEdit") cPointsEdit: any;

	updateClaire(claire: any) {
		if (this.titleEdit.valid && this.cPointsEdit.valid) {
			const obj: any = {
				description: claire.description_temp,
				points: claire.points_temp,
				claireid: claire.claireid
			};
			this.bService.updateClaire(obj).subscribe(
				(res) => {
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.updateClaireSuccess");
					this.toastService.success(message);

					claire.description = claire.description_temp;
					claire.points = claire.points_temp;
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}, () => {
					claire.edit = false;
				}
			);
		}
	}

	deleteClaire(claire: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.manageBehaviour.swal.titleDeleteClaire"),
			text: this.translate.instant("behaviour.manageBehaviour.swal.textDeleteClaire", { description: claire.description }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteClaire(claire.claireid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.deleteClaireSuccess");
						this.toastService.success(message);

						this.bClaire.list.splice(index, 1);
					}, (err) => {
						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.warning(message);
					}, () => {
					});
			}
		});
	}

	@ViewChild("claireItemForm") claireItemForm: any;
	addNewClaireItem() {
		if (this.claireItemForm.valid) {
			const array: any = [];
			array.push(this.newClaireItem);
			this.bService.addClaireItem(array, this.selectedClaire.claireid).subscribe(
				(res) => {
					// console.log(res)
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.addClaireItemSuccess");
					this.toastService.success(message);

					this.viewClaireItem(this.selectedClaire);
					this.claireItemForm.resetForm();
					this.createLeadershipForm.resetForm();
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}
			);
		}
	}
	initEditClaireItem(claireItem: any) {
		claireItem.description_temp = claireItem.description;
		claireItem.edit = true;
	}
	@ViewChild("cdesIName") cdesIName: any;
	updateClaireItem(claireItem: any) {
		if (this.cdesIName.valid) {
			const obj: any = {
				itemid: claireItem.itemid,
				description: claireItem.description_temp
			};
			this.bService.updateClaireItem(obj).subscribe(
				(res) => {
					console.log(res.message);

					const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.updateClaireItemSuccess");
					this.toastService.success(message);

					claireItem.description = claireItem.description_temp;
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");
					this.toastService.warning(message);
				}, () => {
					claireItem.edit = false;
				}
			);
		}
	}

	deleteClaireItem(claire: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.manageBehaviour.swal.titleDeleteClaireItem"),
			text: this.translate.instant("behaviour.manageBehaviour.swal.textDeleteClaireItem", { description: claire.description }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteClaireItem(claire.itemid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.manageBehaviour.toastMessages.deleteClaireItemSuccess");
						this.toastService.success(message);

						this.selectedClaire.items.list.splice(index, 1);
					}, (err) => {
						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.warning(message);
					}, () => {
					});
			}
		});
	}

	getFrequency(fid: any) {
		return this.fMap.get(parseInt(fid));
	}

	isInfractionChecked() {
		if (this.infractionsLoad == 0) {
			this.loadInfractions();
			this.infractionsLoad++;
		}

		this.isInfraction = true;
		this.isMerit = false;
		this.isLeadershipPosition = false;
		this.isClaire = false;
	}

	isMeritChecked() {
		if (this.meritLoad == 0) {
			this.loadMerit();
			this.meritLoad++;
		}
		this.isInfraction = false;
		this.isMerit = true;
		this.isLeadershipPosition = false;
		this.isClaire = false;
	}

	isLeadershipPositionChecked() {
		if (this.leadershipLoad == 0) {
			this.loadLeadershipPosition();
			this.leadershipLoad++;
		}
		this.isInfraction = false;
		this.isMerit = false;
		this.isLeadershipPosition = true;
		this.isClaire = false;
	}

	isClaireChecked() {
		if (this.claireLoad == 0) {
			this.loadClaire();
			this.claireLoad++;
		}
		this.isInfraction = false;
		this.isMerit = false;
		this.isLeadershipPosition = false;
		this.isClaire = true;
	}



}
