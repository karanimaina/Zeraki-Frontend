import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Banner } from "../../models/banners/banner";
import { LitemoreBanner } from "../../models/banners/litemore-banner";
import { PageInfo } from "../../models/common/pagination";

@Injectable({
	providedIn: "root"
})
export class BannerService {
	constructor(private http: HttpClient) { }

	getBanners() {
		return this.http.get<Banner[]>(`${environment.apiurl}/banner`);
	}

	getLitemoreBanners(title?: string, page = 1, pageSize = 10) {
		let url = `${environment.apiurl}/banner/all?page=${page}&pageSize=${pageSize}`;
		if (title) url += `&title=${title}`;

		return this.http.get<{ pageInfo: PageInfo, banners: LitemoreBanner[] }>(url);
	}

	addBanners(payload: FormData) {
		return this.http.post(`${environment.apiurl}/banner`, payload);
	}

	updateBanners(payload: FormData) {
		return this.http.put(`${environment.apiurl}/banner`, payload);
	}

	showBanners(bannerId: number) {
		return this.http.put(`${environment.apiurl}/banner/show?bannerId=${bannerId}`, {});
	}

	hideBanners(bannerId: number) {
		return this.http.put(`${environment.apiurl}/banner/hide?bannerId=${bannerId}`, {});
	}

	deleteBanners(bannerId: number) {
		return this.http.delete(`${environment.apiurl}/banner?bannerId=${bannerId}`);
	}
}
