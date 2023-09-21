import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { FinanceService } from "../../services/finance/finance.service";

@Pipe({
	name: "term"
})
export class TermNamePipe implements PipeTransform {
	constructor(private _financeService: FinanceService) { }
	transform(termId: number): Observable<any> {
		return this._financeService.terms$.pipe(
			map((ts) => ts.list.find((t: any) => t.id == termId))
		);
	}

}

@Pipe({
	name: "voteHeadName",
})
export class VoteHeadNamePipe implements PipeTransform {
	constructor(private _financeService: FinanceService) { }

	transform(voteHeadId: unknown): Observable<string> {
		return this._financeService.voteHeads$.pipe(
			map((r) => r.list.find((v: any) => v.id == voteHeadId).name)
		);
	}
}

@Pipe({
	name: "groupName",
})
export class GroupNamePipe implements PipeTransform {
	constructor(private _financeService: FinanceService) { }

	transform(groupId: number): Observable<any> {
		return this._financeService.groups$.pipe(
			map((groups: any[]) => groups.find((g: any) => g.id === groupId)?.name)
		);
	}
}

@Pipe({
	name: "intakes",
})
export class IntakesPipe implements PipeTransform {
	constructor(private _financeService: FinanceService) { }

	transform(intakeId: number): Observable<any> {
		return this._financeService.intakes$.pipe(
			map((intakes) => intakes.find((intk: any) => intk.id == intakeId)?.name)
		);
	}
}

@Pipe({
	name: "streams",
})
export class StreamsPipe implements PipeTransform {
	constructor(private _financeService: FinanceService) { }

	transform(streamId: number): Observable<any> {
		return this._financeService.streams$.pipe(
			map((streams) => streams.find((str: any) => str.id == streamId)?.name)
		);
	}
}