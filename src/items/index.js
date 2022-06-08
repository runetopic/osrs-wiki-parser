const fs = require('fs');
const wtf = require('wtf_wikipedia');
const _ = require('lodash');
const wikiItems = require('../../data/wiki/items/wiki-text-2022-6-1.json');
const { readVersions, parseName, cleanBonus } = require("../utils/parsingUtils");

const SHOW_ARMS = [
	'chainbody',
];

const SHOW_HAIR = [
	'partyhat',
	'tiara',
	'crown',
	'glasses',
	'spectacles',
	'hat'
]

const SHOW_BEARD = [
	'horns',
	'hat',
	'afro',
	'cowl',
	'tattoo',
	'headdress',
	'hood',
];

const parseWeight = (info, itemId) => {
	const { isVersion1, isVersion2, isVersion3, isVersion4, isVersion5, isVersion6, isVersion7, isVersion8 } = readVersions(info, itemId);

	const defaultWeight = info?.weight?.text;

	if (isVersion1) {
		return info?.weight1?.text || defaultWeight;
	} else if (isVersion2) {
		return info?.weight2?.text || defaultWeight;
	} else if (isVersion3) {
		return info?.weight3?.text || defaultWeight;
	} else if (isVersion4) {
		return info?.weight4?.text || defaultWeight;
	} else if (isVersion5) {
		return info?.weight5?.text || defaultWeight;
	} else if (isVersion6) {
		return info?.weight6?.text || defaultWeight;
	} else if (isVersion7) {
		return info?.weight7?.text || defaultWeight;
	} else if (isVersion8) {
		return info?.weight8?.text || defaultWeight;
	} else {
		return defaultWeight;
	}
};

const parseEquipable = (info, itemId) => {
	const { isVersion1, isVersion2, isVersion3, isVersion4, isVersion5, isVersion6, isVersion7, isVersion8 } = readVersions(info, itemId);

	const defaultEquipable = info?.equipable?.text === 'Yes';

	if (isVersion1) {
		return info?.equipable1?.text === 'Yes' || defaultEquipable;
	} else if (isVersion2) {
		return info?.equipable2?.text === 'Yes' || defaultEquipable;
	} else if (isVersion3) {
		return info?.equipable3?.text === 'Yes' || defaultEquipable;
	} else if (isVersion4) {
		return info?.equipable4?.text === 'Yes' || defaultEquipable;
	} else if (isVersion5) {
		return info?.equipable5?.text === 'Yes' || defaultEquipable;
	} else if (isVersion6) {
		return info?.equipable6?.text === 'Yes' || defaultEquipable;
	} else if (isVersion7) {
		return info?.equipable7?.text === 'Yes' || defaultEquipable;
	} else if (isVersion8) {
		return info?.equipable8?.text === 'Yes' || defaultEquipable;
	} else {
		return defaultEquipable;
	}
};

const parseNotable = (info, itemId) => {
	const { isVersion1, isVersion2, isVersion3, isVersion4, isVersion5, isVersion6, isVersion7, isVersion8 } = readVersions(info, itemId);

	const defaultNoteable = info?.noteable?.text === 'Yes';

	if (isVersion1) {
		return info?.noteable1?.text === 'Yes' || defaultNoteable;
	} else if (isVersion2) {
		return info?.noteable2?.text === 'Yes' || defaultNoteable;
	} else if (isVersion3) {
		return info?.noteable3?.text === 'Yes' || defaultNoteable;
	} else if (isVersion4) {
		return info?.noteable4?.text === 'Yes' || defaultNoteable;
	} else if (isVersion5) {
		return info?.noteable5?.text === 'Yes' || defaultNoteable;
	} else if (isVersion6) {
		return info?.noteable6?.text === 'Yes' || defaultNoteable;
	} else if (isVersion7) {
		return info?.noteable7?.text === 'Yes' || defaultNoteable;
	} else if (isVersion8) {
		return info?.noteable8?.text === 'Yes' || defaultNoteable;
	} else {
		return defaultNoteable;
	}
};

const parsed = Object.keys(wikiItems).map(id => {
	const itemId = parseInt(id);
	const infoBox = wikiItems[itemId][2];

	const parsed = wtf(infoBox).json();

	const infoBoxes = parsed["sections"][0]["infoboxes"];

	const info = infoBoxes[0];

	const name = parseName(info, itemId) || parsed?.title || 'Missing';

	const item = {
		itemId,
		name,
		release: info?.release?.text,
		update: info?.update?.text,
		noteable: parseNotable(info, itemId),
		equipable: parseEquipable(info, itemId),
		destroyOption: info?.destroy?.text,
		weight: parseFloat(parseWeight(info, itemId)?.replace('+', '-')) || 0,
		equipment: null
	};

	// This starts are the first info box, spreading the props, so we can get the latest/missing bonuses on items that have multiple info boxes.
	const wikiBonuses = {
        ...infoBoxes[3],
        ...infoBoxes[2],
        ...infoBoxes[1]
    };

	if (item.equipable && wikiBonuses && Object.keys(wikiBonuses).length > 0) {
		const equipmentSlot = wikiBonuses?.slot?.text || null;

		item.equipment = {
			"attackStab": cleanBonus(wikiBonuses?.astab),
			"attackSlash": cleanBonus(wikiBonuses?.aslash),
			"attackCrush": cleanBonus(wikiBonuses?.attackCrush),
			"attackMagic": cleanBonus(wikiBonuses?.amagic),
			"attackRanged": cleanBonus(wikiBonuses?.arange),
			"defenceStab": cleanBonus(wikiBonuses?.dstab),
			"defenceSlash": cleanBonus(wikiBonuses?.dslash),
			"defenceCrush": cleanBonus(wikiBonuses?.dcrush),
			"defenceMagic": cleanBonus(wikiBonuses?.dmagic),
			"defenceRanged": cleanBonus(wikiBonuses?.drange),
			"strengthBonus": cleanBonus(wikiBonuses?.str),
			"rangedStrength": cleanBonus(wikiBonuses?.rstr),
			"magicDamage": cleanBonus(wikiBonuses?.mdmg, true),
			"prayer": cleanBonus(wikiBonuses?.prayer),
			"equipmentSlot": equipmentSlot,
			"attackSpeed": wikiBonuses?.speed?.number || null,
			"attackRange": wikiBonuses?.attackrange?.number || null,
			"combatStyle": wikiBonuses?.combatstyle?.text || null
		}

		const hideArms = name.toLowerCase().indexOf('dragon chainbody') !== -1 || name.indexOf('chainbody') === -1;
		const hideHair = name.indexOf('med helm') !== -1 || SHOW_HAIR.filter((i) => i.indexOf(name) !== -1).length > 0;
		const showBeard = !hideHair || SHOW_BEARD.indexOf(name) !== -1  || (name.indexOf('mask') !== -1 && name.indexOf('h\'ween') === -1) || (name.indexOf('helm') !== -1 && name.indexOf('full') === -1);

		if (equipmentSlot === 'body') {
			item.equipment.hideArms = hideArms;
		} else if (equipmentSlot === 'head') {
			item.equipment.hideHair = hideHair;
			item.equipment.showBeard = showBeard
		}
	}
	return item;
}).filter(item => !item?.name?.startsWith('Clue scroll'));

fs.writeFile("./data/items/items.json", JSON.stringify(parsed, null, 4), (err) => {
	if (err) {

		console.log(err);
	}
});
