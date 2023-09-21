import {Component} from "@angular/core";
import {imageFromDomToBase64} from "../../../../../../@core/shared/utilities/image-to-base64";

@Component({
	template: ""
})
export class ExtractImagesFromDomComponent {

	getStudentImagesInBase64(studentIds: number[]) {
		const studentImagesInBase64: { [key: string]: string } = {};

		studentIds.forEach((studentId) => {
			const studentImage: any = document.getElementById("img-" + studentId);
			studentImagesInBase64[studentId] = imageFromDomToBase64(studentImage);
		});

		return studentImagesInBase64;
	}

	get schoolLogoInBase64() {
		const schoolLogo = document.getElementById("school-logo");
		return imageFromDomToBase64(schoolLogo);
	}

	get signaturesInBase64() {
		const principalSignature = document.getElementById("principal-signature");
		const principal = imageFromDomToBase64(principalSignature, 80, 80);

		const classTeacherSignature = document.getElementById("class-teacher-signature");
		const classTeacher = imageFromDomToBase64(classTeacherSignature, 80, 80);

		const houseTeacherSignature = document.getElementById("house-teacher-signature");
		const houseTeacher = imageFromDomToBase64(houseTeacherSignature, 80, 80);

		return {
			principal,
			classTeacher,
			houseTeacher
		};
	}

}
