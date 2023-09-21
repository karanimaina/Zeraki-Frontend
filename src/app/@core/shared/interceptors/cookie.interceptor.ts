import { Injectable } from "@angular/core";
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpHeaders
} from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class CookieInterceptor implements HttpInterceptor {

	constructor() {}

	// httpOptions = {
	//   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
	//   withCredentials: true, 
	//   observe: 'response' as 'response'
	// };  

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		request = request.clone({
			// setHeaders: {
			//   cookie: 'treeForm_tree-hi=treeForm:tree:resources:JDBC:connectionPoolResources:mariadb_zztemp_merged_pool; JSESSIONID=47c514b23c3534d1bad3e54a86b8'
			// }
			headers: new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" }),
			withCredentials: true, 
			// observe: 'response' as 'response'
		});
		console.warn("req", request);
		return next.handle(request);
	}
}
