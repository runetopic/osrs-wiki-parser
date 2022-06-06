const cleanBonus = (bonus, isDouble = false) => {
    const cleanedBonus = bonus?.text
        .replace('+', '')
        .replace('%', '') || 0.0;

    if (isDouble) {
        return parseFloat(cleanedBonus) || 0.0;
    } else {
        return parseInt(cleanedBonus) || 0.0;
    }
};

const splitIds = (input) => input?.text?.split(',').map(i => parseInt(i)) || [];

const hasMultipleIds = (info) =>
    splitIds(info?.id1).length !== 1 ||
    splitIds(info?.id2).length !== 1 ||
    splitIds(info?.id3).length !== 1 ||
    splitIds(info?.id4).length !== 1 ||
    splitIds(info?.id5).length !== 1 ||
    splitIds(info?.id6).length !== 1 ||
    splitIds(info?.id7).length !== 1 ||
    splitIds(info?.id8).length !== 1;

const parseVersion = (info, id) => {
    const matchingIdKeys = (key) => key.startsWith("id") && info[key]?.text?.split(',').filter((i) => parseInt(i) === id);

    return Object
        .keys(info)
        .filter((key) => matchingIdKeys(key).length > 0)[0]?.replace('id', '')
};

const parseField = (info, id, match) => info[`${match}${parseVersion(info, id)}`] || info[match] || null;

const readVersions = (info, itemId) => {
    if (hasMultipleIds(info)) {
        // These are not deeply matched ids. do not use ===
        const isVersion1 = splitIds(info?.id1).filter(i => i === itemId).length > 0;
        const isVersion2 = splitIds(info?.id2).filter(i => i === itemId).length > 0;
        const isVersion3 = splitIds(info?.id3).filter(i => i === itemId).length > 0;
        const isVersion4 = splitIds(info?.id4).filter(i => i === itemId).length > 0;
        const isVersion5 = splitIds(info?.id5).filter(i => i === itemId).length > 0;
        const isVersion6 = splitIds(info?.id6).filter(i => i === itemId).length > 0;
        const isVersion7 = splitIds(info?.id7).filter(i => i === itemId).length > 0;
        const isVersion8 = splitIds(info?.id8).filter(i => i === itemId).length > 0;
        return { isVersion1, isVersion2, isVersion3, isVersion4, isVersion5, isVersion6, isVersion7, isVersion8 };
    }

    const isVersion1 = info?.id1?.number === itemId;
    const isVersion2 = info?.id2?.number === itemId;
    const isVersion3 = info?.id3?.number === itemId;
    const isVersion4 = info?.id4?.number === itemId;
    const isVersion5 = info?.id5?.number === itemId;
    const isVersion6 = info?.id6?.number === itemId;
    const isVersion7 = info?.id7?.number === itemId;
    const isVersion8 = info?.id8?.number === itemId;
    return { isVersion1, isVersion2, isVersion3, isVersion4, isVersion5, isVersion6, isVersion7, isVersion8 };
};

const parseName = (info, id) => {
    const { isVersion1, isVersion2, isVersion3, isVersion4, isVersion5, isVersion6, isVersion7, isVersion8 } = readVersions(info, id);

    const defaultName = info?.name?.text;

    if (isVersion1) {
        return info?.name1?.text || defaultName;
    } else if (isVersion2) {
        return info?.name2?.text || defaultName;
    } else if (isVersion3) {
        return info?.name3?.text || defaultName;
    } else if (isVersion4) {
        return info?.name4?.text || defaultName;
    } else if (isVersion5) {
        return info?.name5?.text || defaultName;
    } else if (isVersion6) {
        return info?.name6?.text || defaultName;
    } else if (isVersion7) {
        return info?.name7?.text || defaultName;
    } else if (isVersion8) {
        return info?.name8?.text || defaultName;
    } else {
        return defaultName;
    }
};

module.exports = {
    parseName,
    cleanBonus,
    readVersions,
    splitIds,
    hasMultipleIds,
    parseVersion,
    parseField
};
