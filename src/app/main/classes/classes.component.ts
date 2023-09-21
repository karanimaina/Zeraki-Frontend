import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";

@Component({
	selector: "app-classes",
	templateUrl: "./classes.component.html",
})

export class ClassesComponent implements OnInit, OnDestroy {
	destroys$: Subject<boolean> = new Subject<boolean>();
	constructor(public networkService: NetworkService) { }
	
	ngOnDestroy(): void {
		this.destroys$.next(true);
		this.destroys$.unsubscribe();
	}

	ngOnInit(): void {}

}
