import {ProductStatus} from "./product-status";

export interface ZerakiProductSchool{
    schoolCode:  number
    schoolId:  number
    schoolName:  string
    schoolOptions:  ProductStatus
    senderId?: string;
    [key:string]: any;
}
