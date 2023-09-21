import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
	selector: "app-app-info",
	templateUrl: "./app-info.component.html",
	styleUrls: ["./app-info.component.scss"],
})
export class AppInfoComponent implements OnInit, OnDestroy {

	auth_options: any = {};
	section: any;
	aboutPage = true;
	alive = true;

	constructor() { 
		// const hammerConfig = new HammerGestureConfig()
		// const hammer=hammerConfig.buildHammer(document.getElementById('root')!)
		// fromEvent(hammer, "swipe").pipe(
		//   takeWhile(()=>this.alive)
		//   )
		//   .subscribe((res: any) => {
		//     this.result = res.deltaX < 0?'Left':'Right'
		// });
	}

	ngOnDestroy(): void {
		this.alive = false;
	}

	result = "";
	ngOnInit(): void {
    
		this.auth_options.user_type = 0;
		this.auth_options.section = 0;
		this.auth_options.items = [];
		this.auth_options.animation = "w3-animate-right";
	}

	eventText = "";
	onSwipe(evt: any) {
		const x = Math.abs(evt.deltaX) > 40 ? (evt.deltaX > 0 ? "right" : "left"):"";
		const y = Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? "down" : "up") : "";

		this.eventText += `${x} ${y}<br/>`;
		console.warn("Event >> ", this.eventText);
	}


	setUserType(user_type: any) {
		this.auth_options.user_type = user_type;
		if (this.auth_options.user_type == 1) {
			this.auth_options.items = [];
			const item_0: any = {};
			item_0.title = "ANALYZE RESULTS";
			item_0.info = "Analyze exam results on the go from your phone";
			item_0.image = "../../../assets/img/appinfo/analysis.png";
			item_0.section = 0;
			item_0.show_login = false;
			this.auth_options.items.push(item_0);
			const item_1: any = {};
			item_1.title = "ENTER MARKS";
			item_1.info = "Enter exam results via the app from the comfort of your home";
			item_1.image = "../../../assets/img/appinfo/marks_entry.png";
			item_1.section = 1;
			item_1.show_login = false;
			this.auth_options.items.push(item_1);
			const item_2: any = {};
			item_2.title = "SEND MESSAGES";
			item_2.info = "Send text messages and emails to multiple parents with a single button click";
			item_2.image = "../../../assets/img/appinfo/sms.png";
			item_2.section = 2;
			item_2.show_login = false;
			this.auth_options.items.push(item_2);
			const item_3: any = {};
			item_3.title = "STUDENT INFO";
			item_3.info = "Access students' contacts as well as biographical and behavioural information anytime, anywhere";
			item_3.image = "../../../assets/img/appinfo/student_info.png";
			item_3.section = 3;
			item_3.show_login = false;
			this.auth_options.items.push(item_3);
			const item_4: any = {};
			item_4.title = "REACH OUT TO US";
			//item_4.info = "Teacher accounts are created by the school admins. If your school is already using Zeraki Analytics but you don't know your login details, please contact the school's D.O.S / H.O.D Academics for assistance<br><br>If your school isn't using Zeraki Analytics and you'd like to try it out, please reach out to us on <a href='mailto:requests@zeraki.co.ke?Subject=Zeraki%20Analytics%20Request' target='_top'>requests@zeraki.co.ke</a>";
			item_4.info = "Would your school like to try out Zeraki Analytics? Please reach out to us on <a href='mailto:requests@zeraki.co.ke?Subject=Zeraki%20Analytics%20Request' target='_top'>requests@zeraki.co.ke</a>";
			item_4.image = "../../../assets/img/appinfo/reach_out.png";
			item_4.section = 4;
			item_4.show_login = true;
			this.auth_options.items.push(item_4);
		} else {
			this.auth_options.items = [];
			const item_0: any = {};
			item_0.title = "ANALYZE RESULTS";
			item_0.info = "Analyze your child's results on the go from your phone";
			item_0.image = "../../../assets/img/appinfo/analysis.png";
			item_0.section = 0;
			item_0.show_login = false;
			this.auth_options.items.push(item_0);
			const item_1: any = {};
			item_1.title = "VIEW MESSAGES";
			item_1.info = "Receive communication from the school and access them from within the app";
			item_1.image = "../../../assets/img/appinfo/sms.png";
			item_1.section = 1;
			item_1.show_login = false;
			this.auth_options.items.push(item_1);

			const item_2: any = {};
			item_2.title = "FEE BALANCE";
			item_2.info = "Access your child's fee balance from within the app";
			item_2.image = "../../../assets/img/appinfo/fee.png";
			item_2.section = 2;
			item_2.show_login = false;
			this.auth_options.items.push(item_2);

			const item_3: any = {};
			item_3.title = "NEED HELP?";
			item_3.info = "Parents' accounts are created by the schools. If your child's school uses Zeraki Analytics but you don't know the correct login details to use, please contact your child's class teacher for assistance";
			item_3.image = "../../../assets/img/appinfo/student_info.png";
			item_3.section = 3;
			item_3.show_login = true;
			this.auth_options.items.push(item_3);
		}

		if (this.auth_options.items.length > 0) {
			if (this.section != null && this.section.length > 0 && this.section < this.auth_options.items.length) {
				this.auth_options.section = this.section;
			}
			this.auth_options.current_item = this.auth_options.items[this.auth_options.section];
		}
	}

	onAppInfoitemSwipe_Left() {
		this.onAppInfoitemSwipe(true);
	}

	onAppInfoitemSwipe_Right() {
		this.onAppInfoitemSwipe(false);
	}

	onAppInfoitemSwipe(swipe_left: any) {
		let next_section = this.auth_options.section;
		if (swipe_left != null && swipe_left) {
			this.auth_options.animation = "w3-animate-right";
			next_section = this.auth_options.section + 1;
		} else {
			this.auth_options.animation = "w3-animate-left";
			next_section = this.auth_options.section - 1;
		}

		if (next_section != null && next_section >= 0 && next_section < this.auth_options.items.length) {
			this.auth_options.section = next_section;
			this.auth_options.current_item = this.auth_options.items[this.auth_options.section];
			// $state.go($state.current, {
			//     type: this.auth_options.user_type,
			//     section: this.auth_options.section
			// }, {
			//     notify: false, reload: false, location: 'replace', inherit: true
			// });
		}
	}

}
