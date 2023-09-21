import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import "./polyfills";

import "hammerjs";

if (environment.production) {
	enableProdMode();
	if(window) {
		window.console.log=function(){};
		window.console.error=function(){};
		window.console.warn=function(){};
		window.console.info=function(){};
	}
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
