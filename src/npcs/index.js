const fs = require('fs');
const wtf = require('wtf_wikipedia');

const wikiNPCs = require('../../data/wiki/npcs/monsters-wiki-page-text-2022-6-1.json');
const { parseField } = require("../utils/parsingUtils");
const _ = require("lodash");

const IMMUNE_TEXT = ['Yes', 'Immune'];

const monsters = [];

/**
 * Parse the combat stats from the info box provided.
 * @param box The infobox from the parsed wiki page.
 * @param npcId The npc id to use to match fields to.
 * @returns {{defenceCrush: (*|number), attackRanged: (*|number), defenceSlash: (*|number), attackMagic: (*|number), magicDamage: (*|number), defenceStab: (*|number), defenceMagic: (*|number), attackBonus: (*|number), defenceLevel: (*|number), hitpoints: (*|number), defenceRanged: (*|number), strengthBonus: (*|number), strengthLevel: (*|number), rangedLevel: (*|number), attackLevel: (*|number), magicLevel: (*|number), rangedStrength: (*|number)}}
 */
const parseCombatStats = (box, npcId) => ({
    hitpoints: parseField(box, npcId, 'hitpoints')?.number || 0,
    attackLevel: parseField(box, npcId, 'att')?.number || 0,
    strengthLevel: parseField(box, npcId, 'str')?.number || 0,
    defenceLevel: parseField(box, npcId, 'def')?.number || 0,
    magicLevel: parseField(box, npcId, 'mage')?.number || 0,
    rangedLevel: parseField(box, npcId, 'range')?.number || 0,
    attackBonus: parseField(box, npcId, 'attbns')?.number || 0,
    strengthBonus: parseField(box, npcId, 'strbns')?.number || 0,
    attackMagic: parseField(box, npcId, 'amagic')?.number || 0,
    magicDamage: parseField(box, npcId, 'mbns')?.number || 0,
    attackRanged: parseField(box, npcId, 'arange')?.number || 0,
    rangedStrength: parseField(box, npcId, 'rngbns')?.number || 0,
    defenceStab: parseField(box, npcId, 'dstab')?.number || 0,
    defenceSlash: parseField(box, npcId, 'dslash')?.number || 0,
    defenceCrush: parseField(box, npcId, 'dcrush')?.number || 0,
    defenceMagic: parseField(box, npcId, 'dmagic')?.number || 0,
    defenceRanged: parseField(box, npcId, 'drange')?.number || 0,
});

/**
 * Parse all the immunities this monster has.
 * @param box The info box from the parsed wiki page.
 * @param npcId The npc id to use to match fields to.
 * @returns {{cannonImmune: boolean, thrallImmune: boolean, venomImmune: boolean, poisonImmune: boolean}}
 */
const parseImmunities = (box, npcId) => ({
    poisonImmune: IMMUNE_TEXT.indexOf(parseField(box, npcId, 'immunepoison')?.text) > -1 || false,
    venomImmune: IMMUNE_TEXT.indexOf(parseField(box, npcId, 'immunevenom')?.text) > -1 || false,
    cannonImmune: IMMUNE_TEXT.indexOf(parseField(box, npcId, 'immunecannon')?.text) > -1 || false,
    thrallImmune: IMMUNE_TEXT.indexOf(parseField(box, npcId, 'immunethrall')?.text) > -1 || false
});

/**
 * Parse the monster's slayer information.
 * @param box The infobox from the parsed wiki page.
 * @param npcId The npc id to use to match fields to.
 * @returns {{slayerXP: (*|null), assignedBy: (*|null), slayerLevel: (*|null), category: (*|null)}}
 */
const parseSlayer = (box, npcId) => ({
    slayerLevel: parseField(box, npcId, 'slaylvl')?.number || null,
    slayerXP: parseField(box, npcId, 'slayxp')?.number || null,
    category: parseField(box, npcId, 'cat')?.text?.split(',').map((string) => string.trim())  || null,
    assignedBy: parseField(box, npcId, 'assignedby')?.text?.split(',')|| null
});

/**
 * Parse all of the combat related information for this monster.
 * @param box The infobox from the parsed wiki page.
 * @param npcId The npc id to use to match fields to.
 * @returns {{maxHit: (*|null), attackSpeed: (*|null), attackStyles: (*|null), attributes: (*|null), aggressive: (boolean|null), poisonous: boolean, combatLevel: (*|null)}}
 */
const parseCombatInfo = (box, npcId) => ({
    combatLevel: parseField(box, npcId, 'combat')?.number || null,
    attributes: parseField(box, npcId, 'attributes')?.text?.split(',').map((string) => string.trim()) || null,
    maxHit: parseField(box, npcId, 'max hit')?.text?.split(',').map((string) => string.trim()) || null,
    aggressive: parseField(box, npcId, 'aggressive')?.text?.indexOf('Yes') > -1 || null,
    poisonous: parseField(box, npcId, 'poisonous')?.text === 'Yes' || false,
    attackStyles: parseField(box, npcId, 'attack style')?.text?.split(',').map((string) => string.trim()) || null,
    attackSpeed: parseField(box, npcId, 'attack speed')?.number || null,
});

/**
 * Parse the misc monster info.
 * @param box
 * @param npcId
 * @returns {{respawn: (*|null), race: (boolean|null), size: (*|null), examine: (*|null), release: (*|null), members: (boolean|null), xpBonus: (*|null), update: (*|null)}}
 */
const parseInfo = (box, npcId) => ({
    release: parseField(box, npcId, 'release')?.text || null,
    update: parseField(box, npcId, 'update')?.text || null,
    members: parseField(box, npcId, 'members')?.text === 'Yes' || null,
    race: parseField(box, npcId, 'race')?.text === 'Yes' || null,
    examine: parseField(box, npcId, 'examine')?.text || null,
    size: parseField(box, npcId, 'size')?.number || null,
    xpBonus: parseField(box, npcId, 'xpbonus')?.number || null,
    respawn: parseField(box, npcId, 'respawn')?.number || null,
});

/**
 * Iterate over all the wiki npcs, and start extracting out the data to build the monsters array.
 */
Object.keys(wikiNPCs).forEach(id => {
    const npcId = parseInt(id);
    const name = wikiNPCs[npcId][0];
    const npc = wtf(wikiNPCs[npcId][2]).json();

    npc?.sections.flatMap(i => i?.infoboxes).filter(i => i != null).forEach(box => {
        const monster = {
            npcId,
            name,
        };

        const info = parseInfo(box, npcId);
        const combatInfo = parseCombatInfo(box, npcId);
        const slayer = parseSlayer(box, npcId);
        const levels = parseCombatStats(box, npcId);
        const immunities = parseImmunities(box, npcId);

        if (!_.isEmpty(info)) monster.info = info;
        if (!_.isEmpty(combatInfo)) monster.combatInfo = combatInfo;
        if (!_.isEmpty(slayer)) monster.slayer = slayer;
        if (!_.isEmpty(levels)) monster.levels = levels;
        if (!_.isEmpty(immunities)) monster.immunities = immunities;

        monsters.push(monster);
    });
});

/**
 * Writes the file to the data directory.
 */
fs.writeFile("./data/npcs/npcs.json", JSON.stringify(monsters, null, 4), (err) => {
    if (err) {

        console.log(err);
    }
});
