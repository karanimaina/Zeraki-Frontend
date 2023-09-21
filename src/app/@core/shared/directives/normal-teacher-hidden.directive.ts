import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { RolesService } from "../services/role/roles.service";

@Directive({
	selector: "[appNormalTeacherHidden]",
})
export class NormalTeacherHiddenDirective {
	private hasView = false;

	constructor(
		private templateRef: TemplateRef<any>,
		private viewContainer: ViewContainerRef,
		private rolesService: RolesService,
	) {}

	@Input()
	set appNormalTeacherHidden(condition: boolean) {
		const isNormalTeacher = this.rolesService.isNormalTeacher;

		if (!isNormalTeacher && !this.hasView) {
			this.viewContainer.createEmbeddedView(this.templateRef);
			this.hasView = true;
		} else if (isNormalTeacher && this.hasView) {
			this.viewContainer.clear();
			this.hasView = false;
		}
	}
}
