import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, timer, throwError, of } from "rxjs";
import { retryWhen, tap, mergeMap } from "rxjs/operators";


@Injectable()
export class RetryInterceptor implements HttpInterceptor {
	retryDelay = 2000;
	retryMaxAttempts = 3; //Retry for a maximum of 5 times with a delay of 1 second
	statusCodesToRetry = [408, 502, 503, 504, 0];
	constructor() { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request)
			.pipe(
				this.retryAfterDelay(),
			);
	}

	retryAfterDelay(): any {
		return retryWhen(errors => {
			return errors.pipe(
				mergeMap((err, count) => {
					// throw error when we've retried ${retryMaxAttempts} number of times and still get an error
					console.warn("err >> ", err);
					if (count === this.retryMaxAttempts || !this.statusCodesToRetry.includes(err.status) ) {
						return throwError(err);
					}

					return of(err).pipe(
						tap(error => console.log(`Failed url: ${error.url}. Retrying in ${this.retryDelay * (count + 1)}`)),
						mergeMap(() => timer(this.retryDelay * (count + 1))),
					);
				})
			);
		});
	}
}
