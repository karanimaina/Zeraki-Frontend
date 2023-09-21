import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-schools',
  templateUrl: './my-schools.component.html',
  styleUrls: ['./my-schools.component.scss']
})
export class MySchoolsComponent implements OnInit {

  // incoming variables from parent
  @Input() mySchools:any;
  @Input() isLoadingSchools!:boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
