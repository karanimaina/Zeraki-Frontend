import {OptionGroup} from "./option-group";
import {SchoolOption} from "./school-option";

export class OptionGroupMapper {
	private unformattedOptionGroups: any[] = [];

	constructor(unformattedOptionGroups) {
		this.unformattedOptionGroups = unformattedOptionGroups;
	}

	getOptionGroups(): OptionGroup[] {
		return this.unformattedOptionGroups.map((group) => ({
			groupId: group.groupid,
			title: group.title,
			options: OptionGroupMapper.getSchoolOptions(group.options)
		}));
	}

	private static getSchoolOptions(options): SchoolOption[] {
		return options.map((option) => ({
			id: option.id,
			title: option.title,
			tag: option.tag,
			text: option.text,
			isBoolean: option.is_boolean,
			isEnum: option.is_enum,
			choices: option.choices,
			value: option.value,
			warningTitle: option.warning_title,
			warningMessage: option.warning_msg
		}));
	}
}
