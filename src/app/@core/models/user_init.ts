export interface UserInit {
    school_selected: boolean,
    customer_care_number: string,
    role: number,
    schools: Array<School>,
    isRelationshipManager: boolean,
    auth_msg: string,
    isLitemoreEditor: boolean,
    isStudent: boolean,
    school_validity_info: {
        is_valid_school: boolean,
        validity_type: number
    }
    require_auth_reset: any;
}

export interface School {
    schoolid: number,
    name: string,
    logo: string,
    type: string
}