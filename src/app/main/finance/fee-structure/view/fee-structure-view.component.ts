import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FinanceService } from "src/app/@core/services/finance/finance.service";

@Component({
	selector: "app-fee-structure-view",
	templateUrl: "./fee-structure-view.component.html",
	styleUrls: ["./fee-structure-view.component.scss"]
})
export class FeeStructureViewComponent implements OnInit {

	feeStructure?: any;
	feeStructureId?: any;
	groups: any;
	// feeStructureItems?: any[];
	feeStructureGroups: any;
	feeStructureVoteHeads: any;

	constructor(
    private activatedRoute: ActivatedRoute,
    private financeService: FinanceService,
    public location: Location
	) { }

	ngOnInit(): void {
		this.feeStructureId = Number(
			this.activatedRoute.snapshot.paramMap.get("feeStructureId")
		);
		this.getFeeStructure();
	}

	getFeeStructure(): void {
		this.financeService
			.getFeeStructure(this.feeStructureId)
			.subscribe((feeStructure) => {
				// this.financeService.selectedFeeStructure = feeStructure; // 'cache' the fee structure for editing and invoicing page
				this.feeStructure = feeStructure;
				const feeStructureItems = feeStructure.feeStructureItems;
				this.setFeeStructureGroups(feeStructureItems);
				this.setFeeStructureVoteHeads(feeStructureItems);
			});
	}

	setFeeStructureGroups(feeStructureItems: any[]): void {
		const fsItemsWithGroups = feeStructureItems.filter(
			(i: any) => i.feeStructureGroupId && i.feeStructureGroupId !== "All"
		);
		const fsiGroups = fsItemsWithGroups?.map(
			(i: any) => i.feeStructureGroupId
		);
		this.feeStructureGroups = [...new Set(fsiGroups)];
	}

	setFeeStructureVoteHeads(feeStructureItems: any[]): void {
		const fsiVoteHeads = feeStructureItems.map(
			(i: any) => i.voteHeadId
		);
		this.feeStructureVoteHeads = [...new Set(fsiVoteHeads)];
	}

	getAllVoteHeadAmount(voteHeadId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const fsItemsForAll = feeStructureItems.find(
			(i: any) =>
				i.voteHeadId === voteHeadId &&
        i.boardingStatus === "All" &&
        (i.feeStructureGroupId === "All" || !i.feeStructureGroupId) // TODO
		);
		return fsItemsForAll?.amount || 0;
	}

	getBoardingVoteHeadAmount(voteHeadId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const fsItemForBoarding = feeStructureItems.find(
			(i: any) =>
				i.voteHeadId === voteHeadId &&
        i.boardingStatus === "Boarding" &&
        (i.feeStructureGroupId === "All" || !i.feeStructureGroupId) // TODO
		);
		return fsItemForBoarding?.amount || this.getAllVoteHeadAmount(voteHeadId); // If boarding votehead has no specified amount the amount for all is used
	}

	getDayVoteHeadAmount(voteHeadId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const fsItemForDay = feeStructureItems.find(
			(i: any) =>
				i.voteHeadId === voteHeadId &&
        i.boardingStatus === "Day" &&
        (i.feeStructureGroupId === "All" || !i.feeStructureGroupId) // TODO
		);
		return fsItemForDay?.amount || this.getAllVoteHeadAmount(voteHeadId); // If boarding votehead has no specified amount the amount for all is used
	}

	getAllGroupAmount(voteHeadId: number, groupId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const groupFsItemForAll = feeStructureItems.find(
			(i: any) =>
				i.voteHeadId === voteHeadId &&
        i.boardingStatus === "All" &&
        i.feeStructureGroupId === groupId
		);
		return groupFsItemForAll?.amount || this.getAllVoteHeadAmount(voteHeadId);
	}

	getBoardingGroupAmount(voteHeadId: number, groupId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const groupFsItemForBoarding = feeStructureItems.find(
			(i: any) =>
				i.voteHeadId === voteHeadId &&
        i.boardingStatus === "Boarding" &&
        i.feeStructureGroupId === groupId
		);
		return (
			groupFsItemForBoarding?.amount ||
      this.getAllGroupAmount(voteHeadId, groupId)
		);
	}

	getDayGroupAmount(voteHeadId: number, groupId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const groupFsItemForDay = feeStructureItems.find(
			(i: any) =>
				i.voteHeadId === voteHeadId &&
        i.boardingStatus === "Day" &&
        i.feeStructureGroupId === groupId
		);
		return (
			groupFsItemForDay?.amount || this.getAllGroupAmount(voteHeadId, groupId)
		);
	}

	getAllTotal(): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const fsItemsForAll = feeStructureItems.filter(
			(i: any) =>
				i.boardingStatus === "All" &&
        (i.feeStructureGroupId === "All" || !i.feeStructureGroupId) // TODO
		);
		const total = fsItemsForAll?.reduce(
			(prev: any, curr: any) => prev + curr.amount,
			0
		);
		return total || 0;
	}

	getBoardingTotal(): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const fsItemsForBoarding = feeStructureItems.filter(
			(i: any) =>
				(i.boardingStatus === "Boarding" || i.boardingStatus === "All") &&
        (i.feeStructureGroupId === "All" || !i.feeStructureGroupId) // TODO
		);
		const total = fsItemsForBoarding?.reduce(
			(prev: any, curr: any) => prev + curr.amount,
			0
		);
		return total || this.getAllTotal();
	}

	getDayTotal(): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const fsItemsForDay = feeStructureItems.filter(
			(i: any) =>
				(i.boardingStatus === "Day" || i.boardingStatus === "All") &&
        (i.feeStructureGroupId === "All" || !i.feeStructureGroupId) // TODO
		);
		const total = fsItemsForDay?.reduce(
			(prev: any, curr: any) => prev + curr.amount,
			0
		);
		return total || this.getAllTotal();
	}

	getAllGroupTotal(groupId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const groupFsItemsForAll = feeStructureItems.filter(
			(i: any) =>
				i.boardingStatus === "All" && i.feeStructureGroupId === groupId
		);
		const total = groupFsItemsForAll?.reduce(
			(prev: any, curr: any) => prev + curr.amount,
			0
		);
		return total || 0;
	}

	getBoardingGroupTotal(groupId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const groupFsItemsForBoarding = feeStructureItems.filter(
			(i: any) =>
				i.boardingStatus === "Boarding" && i.feeStructureGroupId === groupId
		);
		const total = groupFsItemsForBoarding?.reduce(
			(prev: any, curr: any) => prev + curr.amount,
			0
		);
		return total || this.getAllGroupTotal(groupId);
	}

	getDayGroupTotal(groupId: number): number {
		const feeStructureItems = this.feeStructure.feeStructureItems;
		const groupFsItemsForDay = feeStructureItems.filter(
			(i: any) =>
				i.boardingStatus === "Day" && i.feeStructureGroupId === groupId
		);
		const total = groupFsItemsForDay?.reduce(
			(prev: any, curr: any) => prev + curr.amount,
			0
		);
		return total || this.getAllGroupTotal(groupId);
	}

	printPage(printSectionId: string) {

		const innerContents = document?.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open("", "_blank", "width=device-width");
		popupWinindow?.document.open();
		popupWinindow?.document.write("<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"assets_new/styles/vendor.cf60403d.css\"><link rel=\"stylesheet\" href=\"assets_new/styles/style.bb02c2e3.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" + innerContents + "</html>");
		popupWinindow?.document.close();
	}
}
