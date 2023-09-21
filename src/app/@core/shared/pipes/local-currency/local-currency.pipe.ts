import { CurrencyPipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";

@Pipe({
	name: "localCurrency"
})
export class LocalCurrencyPipe implements PipeTransform {
	constructor(
		private currencyPipe: CurrencyPipe,
		private readonly _currentCountryState: CurrentCountryState
	) {}
	transform(value = 0): Observable<any> {
		return this._currentCountryState.currentCountry$.pipe(
			map((country) =>
				this.currencyPipe.transform(
					value,
					country?.currency ? `${country?.currency} ` : "KES "
				)
			)
		);
	}
}
