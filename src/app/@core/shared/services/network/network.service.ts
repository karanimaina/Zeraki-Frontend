import { Injectable } from "@angular/core";
import { fromEvent, merge, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
	providedIn: "root"
})
export class NetworkService {

	online: boolean = navigator.onLine;
	isNetworkStopped = false;

	constructor() { 
		merge(
			of(null),
			fromEvent(window, "online"),
			fromEvent(window, "offline")
		).pipe(map(() => navigator.onLine))
			.subscribe((status) => {
				this.online = status;
			});
	}

	checkNetworkStatus() {
		return merge(
			of(navigator.onLine),
			fromEvent(window, "online"),
			fromEvent(window, "offline")
		)
			.pipe(map(() => navigator.onLine));

	}
}
