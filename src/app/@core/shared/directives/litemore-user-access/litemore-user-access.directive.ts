import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { RolesService } from "../../services/role/roles.service";

@Directive({
	selector: "[appLitemoreUserAccess]"
})
export class LitemoreUserAccessDirective {
	@Input() hideComponent = false;

	private allowedUserRoles: string[] = [];
	private loggedInUserRoles: string[] = [];

	constructor(
		private templateRef: TemplateRef<any>,
		private viewContainerRef: ViewContainerRef,
		private rolesService: RolesService,
	) { }

	@Input()
	set appLitemoreUserAccess(allowedUserRoles: LitemoreUserRole[]) {
		this.allowedUserRoles = allowedUserRoles;

		this.rolesService.roleSubject.subscribe((userRole) => {
			this.loggedInUserRoles = userRole?.litemoreRoles;
			this.decideVisibility();
		});
	}

	@Input()
	set appLitemoreUserAccessHideComponent(hideComponent: boolean) {
		this.hideComponent = hideComponent;
		this.decideVisibility();
	}

	private decideVisibility() {
		this.viewContainerRef.clear();

		if ((!this.hideComponent && this.allowedUserRoles.some(allowedUserRole => this.loggedInUserRoles?.includes(allowedUserRole)) || (this.hideComponent && !this.allowedUserRoles.some(allowedUserRole => this.loggedInUserRoles?.includes(allowedUserRole))))) {
			this.showComponent();
		}
	}

	showComponent() {
		this.viewContainerRef.createEmbeddedView(this.templateRef);
	}

}
