import { Component, OnDestroy, OnInit } from "@angular/core";
import { combineLatest, Observable, of, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Region } from "src/app/@core/models/region/region";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";

@Component({
	selector: "app-list",
	templateUrl: "./list.component.html",
	styleUrls: ["./list.component.scss"]
})
export class ListComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	members: Array<any> = [
		{ "isRegionalManager": true, "regionId": 1, "isRevenueOfficer": false, "name": "Test 1", "isRelationshipManager": true, "isCxTeamMember": false, "userId": 384594, "isBDevManager": true },
		{ "isRegionalManager": true, "regionId": 2, "isRevenueOfficer": false, "name": "Test 2", "isRelationshipManager": true, "isCxTeamMember": false, "userId": 384594, "isBDevManager": true },
		{ "isRegionalManager": true, "regionId": 3, "isRevenueOfficer": false, "name": "Test 3", "isRelationshipManager": true, "isCxTeamMember": false, "userId": 384594, "isBDevManager": true },
		{ "isRegionalManager": true, "regionId": 14, "isRevenueOfficer": false, "name": "Test 4", "isRelationshipManager": true, "isCxTeamMember": false, "userId": 384594, "isBDevManager": true }
	];
	members$: Observable<any[]> = of(this.members);
	regions$: Observable<Region[]> = this.bdevService.regions$;

	constructor(private bdevService: BdevService) { }

	ngOnDestroy(): void { }

	ngOnInit(): void {
		this.mapMembers();
	}

	addUser() {
		// console.warn("Form value >> ", this.usersForm.value);
	}

	assignRegion(userId: number, regionId: number) {
		console.warn("assignRegion >> ", userId, regionId);
		
		// Refresh members
		// this.bdevService.resetMembers();
	}

	unassignRegion(userId: number) {
		console.warn("unassignRegion >> ", userId);

		// Refresh members
		// this.bdevService.resetMembers();
	}

	mapMembers() {
		combineLatest([
			this.members$,
			this.regions$
		]).pipe(takeUntil(this.destroy$)).subscribe(([members, regions]) => {
			members?.forEach(member => {
				if (member.regionId && regions.length > 0) {
					member.region = regions.filter(region => member.regionId == region.regionId)[0];
				}
			});
		});
	}

}
