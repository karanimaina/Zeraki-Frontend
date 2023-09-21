import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { Paper, PaperStatus, SubjectPapers } from "../../models/subject-papers";
import { RolesService } from "../../../../../../@core/shared/services/role/roles.service";
import { SubjectPaperService } from "../../services/subject-paper.service";
import { SubjectPaperPresets } from "src/app/@core/models/exams/subject-paper-ratio";

@Component({
	selector: "app-subject-papers",
	templateUrl: "./subject-papers.component.html",
	styleUrls: ["./subject-papers.component.scss"],
})
export class SubjectPapersComponent implements OnInit {
	subjectPaperPresetsMap: Map<number, SubjectPaperPresets> = new Map<
		number,
		SubjectPaperPresets
	>();
	subjects: any[] = [];
	examName!: string;
	addable!: boolean;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	isLoading = true;
	subjectPapers: SubjectPapers[] = [];
	enableAllSubjectPapers = true;
	intakeId!: number;
	seriesId!: number;

	constructor(
		private rolesService: RolesService,
		private route: ActivatedRoute,
		private subjectPaperService: SubjectPaperService
	) {}

	ngOnInit(): void {
		this.loadSubjectPaperPresets();
	}

	loadSubjectPaperPresets() {
		this.intakeId = this.route.snapshot.params["intakeId"];
		this.seriesId = this.route.snapshot.params["seriesId"];

		this.subjectPaperService.getSubjectPapers().subscribe((subjectPapers) => {
			subjectPapers.presets.forEach((preset: SubjectPaperPresets) => {
				this.subjectPaperPresetsMap.set(preset.subjectId, preset);
			});

			this.fetchPapers();
		});
	}

	fetchPapers() {
		this.subjectPaperService
			.getExamDetails(this.intakeId, this.seriesId)
			.subscribe((resp) => {
				this.subjects = resp.subjects;
				this.setSubjectPapers();
				this.examName = resp.examname_display;
				this.addable = resp.addable;
				this.isLoading = false;
			});
	}

	setSubjectPapers() {
		this.subjectPapers = [];
		this.enableAllSubjectPapers = !this.subjects.some(
			(subject) =>
				this.subjectPaperPresetsMap.has(subject.subjectid) &&
				subject.papers.length
		);

		this.subjects.forEach((subject) => {
			const subjectPaper: SubjectPapers = {
				subjectId: subject.subjectid,
				subjectName: subject.name,
				hasDefaultPaperPresets: this.subjectPaperPresetsMap.has(
					subject.subjectid
				),
				papers: this.getPapers(subject.papers, subject.subjectid),
			};

			this.subjectPapers.push(subjectPaper);
		});
	}

	getPapers(papers: any[], subjectId: number) {
		const DEFAULT_NO_OF_PAPERS = 4;
		const MIN_NO_OF_PAPERS = 2;
		const hasDefaultPaperPresets = this.subjectPaperPresetsMap.has(subjectId);
		const numberOfPapers = hasDefaultPaperPresets
			? DEFAULT_NO_OF_PAPERS
			: MIN_NO_OF_PAPERS;
		const paperArray: any[] = [];
		const paperPresets = this.subjectPaperPresetsMap.get(subjectId);

		for (let paperNumber = 1; paperNumber <= numberOfPapers; paperNumber++) {
			const paperName = "Paper " + paperNumber;
			const paper = papers.find((p) => p.paperName === paperName);

			const paperMaxKey = "paper" + paperNumber + "Max";
			const paperRatioKey = "paper" + paperNumber + "Ratio";

			if (
				hasDefaultPaperPresets &&
				paperPresets &&
				(paperNumber <= MIN_NO_OF_PAPERS || paperPresets[paperRatioKey] != null)
			) {
				const subjectPaper: Paper = {
					paperId: paper?.paperId,
					paperName: paperName,
					ratio: paper?.ratio || paperPresets[paperRatioKey],
					status: paper?.status ? PaperStatus.ACTIVE : PaperStatus.DISABLED,
					maxMarks: paperPresets[paperMaxKey] || 0,
				};

				paperArray.push(subjectPaper);
			}

			if (!hasDefaultPaperPresets) {
				const subjectPaper: Paper = {
					paperId: null,
					paperName: paperName,
					ratio: null,
					status: PaperStatus.UNSET,
					maxMarks: 0,
				};

				paperArray.push(subjectPaper);
			}
		}

		return paperArray;
	}
}
