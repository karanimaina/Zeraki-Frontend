import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-tz-sec-comments",
	templateUrl: "./tz-sec-comments.component.html",
	styleUrls: ["./tz-sec-comments.component.scss"]
})
export class TzSecCommentsComponent implements OnInit {

  @Input() rp: any;
  @Input() show_houseteachers_comments = true;
  @Input() show_houseteachers_signature = true;
  @Input() show_deputy_hm_academic_comments = true;
  @Input() show_deputy_hm_academic_signature = true;
  @Input() show_principal_comments = true;
  @Input() show_principal_signature = true;

  userRoles$: Observable<Role> = this.rolesService.roleSubject;
  
  constructor(private rolesService: RolesService) { }

  ngOnInit(): void {
  }

}
