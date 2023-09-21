import { Injectable } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class ResponseHandlerService {

	constructor(private toastService: HotToastService, private translate: TranslateService) { }

	error(error: any, functionName: string) {
		const message = this.translate.instant("common.toastMessages.anErrorOccurred");
		this.toastService.error(error?.error?.response?.message || error?.error?.message || error?.message || message);
		console.error(`${functionName} >> ${JSON.stringify(error)}`);
	}

	warn(error: any, functionName?: string) {
		const message = this.translate.instant("common.toastMessages.anErrorOccurred");
		this.toastService.warning(error?.error?.response?.message || error?.error?.message || error?.message || message);
		console.warn(`${functionName} >> ${JSON.stringify(error)}`);
	}

	info(response: any, functionName?: string) {
		const message = this.translate.instant("common.toastMessages.info");
		this.toastService.info(response?.response?.message || response?.message || message);
		console.info(`${functionName} >> ${JSON.stringify(response)}`);
	}

	success(response: any, functionName?: string) {
		const message = this.translate.instant("common.toastMessages.success");
		this.toastService.success(response?.response?.message || response?.message || message);
		// console.info(`${functionName} >> ${JSON.stringify(response)}`);
	}
}
