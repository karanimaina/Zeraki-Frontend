import { Injectable } from "@angular/core";
import { messages } from "src/app/@core/enums/field-errors/messages";

@Injectable({
	providedIn: "root"
})
export class FieldService {

	constructor() { }
  
	get(key: string): string {
		return messages[key] || key;
	}
}
