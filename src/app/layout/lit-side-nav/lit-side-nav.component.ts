import { Component, Input, OnInit } from "@angular/core";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";

@Component({
	selector: "app-lit-side-nav",
	templateUrl: "./lit-side-nav.component.html",
	styleUrls: ["./lit-side-nav.component.scss"]
})
export class LitSideNavComponent implements OnInit {
	@Input() networkStatus?: boolean | null;

	readonly LitemoreUserRole = LitemoreUserRole;

	constructor() { }

	ngOnInit(): void {}

}
