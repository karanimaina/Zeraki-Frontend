import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import * as uuid from "uuid";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { HttpEventType } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from "rxjs/operators";

@Component({
	selector: "app-update-photo",
	templateUrl: "./update-photo.component.html",
	styleUrls: ["./update-photo.component.scss"]
})
export class UpdatePhotoComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	upload_type: any;
	imgSelected = false;
	selectedFiles: any[] = [];
	file?: File;
	upload_type_options: { id: number; name: string; }[] = [];
	schoolTypeData: any;

	upload_students_photos_success_msg = "";
	upload_students_photos_success_status = false;
	error_photos = false;
	error_msg = "";
	showLoading = false;
	isPortable = false; // $scope.isPortable = utilityService.getIsPortable();
	cloud_images: any[] = [];

	constructor(
		private dataService: DataService,
		private translateService: TranslateService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.upload_type_options.push({ id: 1, name: "Images named after Admission Numbers" });
		this.upload_type_options.push({ id: 2, name: "Images named after UPI Numbers" });
		this.upload_type = this.upload_type_options[0];
		this.getSchoolTypeData();
	}

	getSchoolTypeData() {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe(val => {
			// console.warn("getSchoolTypeData >> ", val);
			this.schoolTypeData = val;
			if (this.schoolTypeData?.isKcseSchool) {
				this.upload_type_options.push({ id: 3, name: "Images named after Index Numbers" });
			}
			this.translateOptions();
		});
	}

	translateOptions() {
		this.upload_type_options.map(option => {
			switch (option.id) {
			case 1:
				option.name = this.translateService.instant("students.up_Photo.afterAdm");
				break;
			case 2:
				option.name = this.translateService.instant("students.up_Photo.afterUpi");
				break;
			case 3:
				option.name = this.translateService.instant("students.up_Photo.afterIndex");
				break;

			default:
				break;
			}
		});
	}

	detectFiles(event: any) {
		// this.isDataVerified = false;
		this.selectedFiles = event.target.files;

		for (let i = this.selectedFiles.length - 1; i >= 0; i--) {
			const file = this.selectedFiles[i];
			file.uploadPending = true;
		}
	}

	discardFiles() {
		this.selectedFiles = [];
	}

	initBoolean() {
		this.upload_students_photos_success_msg = "";
		this.upload_students_photos_success_status = false;
		this.error_photos = false;
		this.error_msg = "";
		this.showLoading = false;
	}

	doUploadFiles() {
		this.initBoolean();
		if (this.selectedFiles.length > 0) {
			let current = 0;
			if (this.isPortable) {
				// angularjs dev
			} else {
				this.showLoading = true;
				this.cloud_images = [];

				/**Limit upload size to 1mb */
				const maximumSize = 1; // In megabytes(mb)

				for (let i = this.selectedFiles.length - 1; i >= 0; i--) {
					const file = this.selectedFiles[i];

					/**File size */
					const fileSize = (file.size / 1024) / 1024;
					if (fileSize > maximumSize) {

						file.upload_msg = this.translateService.instant("common.maximumFilesize", { maxsize: `${maximumSize}mb` });
						continue;
					}

					const date = new Date().getTime();
					const image_name = uuid.v4() + "_" + date + "_" + Math.floor(Math.random() * 10000000);
					const url = "https://www.googleapis.com/upload/storage/v1/b/z_analytics_student_images/o?uploadType=media&name=" + image_name + "&key=AIzaSyAYygnoTN0QtVj7LldwAfO3TVE8xB0bogs";
					file.custom_file_name = image_name;
					this.dataService.sendFile(file, url)
						// .pipe(finalize(() => this.reset()))
						.pipe(takeUntil(this.destroy$))
						.subscribe(event => {
							file.uploading = false;
							const storedPath = "https://storage.googleapis.com/z_analytics_student_images/" + image_name;
							const currentItem: any = {};
							currentItem.custom_filename = image_name;
							currentItem.filename = file.name;
							currentItem.url = storedPath;

							this.cloud_images.push(currentItem);
							current++;
							if (current === this.selectedFiles.length) {
								this.finalizeUpload_Cloud();
							}
							if (event.type == HttpEventType.UploadProgress) {
								file.progress = Math.round(100 * (event.loaded / (event.total || 0)));
								// console.warn(`File ${i} progress >> `, file.progress);
							}
						});
				}
			}
		}
	}

	finalizeUpload_Cloud() {
		this.dataService.send(this.cloud_images, `groups/images/cloudsave?type=${this.upload_type.id}`)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: resp => {
					const responseData: any = resp;
					// console.warn("DATA finalizeUpload_Cloud >> ", responseData);
					let error_occurred = false;
					for (let i = this.selectedFiles.length - 1; i >= 0; i--) {
						const file = this.selectedFiles[i];
						file.uploadPending = false;
						if (responseData[file.custom_file_name] !== undefined) {
							if (responseData[file.custom_file_name].status_code === 200) {
								file.upload_success = true;
							} else {
								file.upload_success = false;
								file.upload_msg = responseData[file.custom_file_name].status_desc;
								error_occurred = true;
							}
						} else {
							file.upload_success = false;
							error_occurred = true;
						}
						// console.warn("Here's the file >> ",i, file);
					}
					this.finalizeUpload(error_occurred);
				},
				error: error => {
					// this.errorMessage = error.message;
					this.error_msg = "An unexpected error occurred. Please try again.";
					this.error_photos = true;

					for (let i = this.selectedFiles.length - 1; i >= 0; i--) {
						const file = this.selectedFiles[i];
						file.uploadPending = false;
						file.upload_success = false;
					}
				}
			});
	}

	finalizeUpload(error_occurred: boolean) {
		if (error_occurred) {
			this.error_msg = "Some images failed to upload. Please try again.";
			this.error_photos = true;
		} else {
			this.upload_students_photos_success_msg = "All images were uploaded successfully";
			this.upload_students_photos_success_status = true;
		}
		this.showLoading = false;
	}

}
