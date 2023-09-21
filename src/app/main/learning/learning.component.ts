import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/@core/shared/services/user/user.service";

@Component({
	selector: "app-learning",
	templateUrl: "./learning.component.html",
	styleUrls: ["./learning.component.scss"]
})
export class LearningComponent implements OnInit {

	constructor(private userService: UserService) { }

	ngOnInit(): void {
		this.getUserInfo();
	}


	userInfo: any = {};
	getUserInfo(): void {
		this.userService.userInfoSubject.subscribe(
			userInfo => {
				this.userInfo = userInfo;
			}
		);
	}


}
