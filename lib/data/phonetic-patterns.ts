import {
  VowelPhoneme,
  ConsonantRules,
  MorphemePatterns,
  PhoneticPattern,
  InitialCluster,
  VowelPatterns
} from '@/lib/types/vocal-translator';

// Phoneme-based vowel transforms
export const vowelPhonemes: VowelPhoneme = {
  // Monophthongs
  'i': { 1: 'i', 4: 'ih', 8: 'eh' },        // bit → bih → beh
  'ɪ': { 1: 'i', 4: 'ih', 8: 'eh' },        // bit → bih → beh
  'e': { 1: 'e', 4: 'eh', 8: 'eh' },        // bet → beht
  'ɛ': { 1: 'eh', 4: 'eh', 8: 'ah' },       // bet → baht
  'æ': { 1: 'a', 4: 'ah', 8: 'ah' },        // bat → baht
  'a_akes': { 1: 'a', 4: 'ae', 8: 'ah' },   // takes → taeks → tahks (special 'akes' context)
  'a_ates': { 1: 'a', 4: 'ae', 8: 'ah' },   // mates → maets → mahts
  'o_otes': { 1: 'o', 4: 'oh', 8: 'ah' },   // motes → mohts → mahts
  'o_okes': { 1: 'o', 4: 'oh', 8: 'ah' },   // tokes → tohks → tahks
  'ə': { 1: 'uh', 4: 'ah', 8: 'ah' },       // about → ahbaht
  'ʌ': { 1: 'uh', 4: 'ah', 8: 'ah' },       // but → baht
  'ɑ': { 1: 'ah', 4: 'ah', 8: 'ah' },       // bot → baht
  'ɔ': { 1: 'aw', 4: 'oh', 8: 'ah' },       // bought → baht
  'y': { 1: 'y', 4: 'eh', 8: 'e' },         // y as vowel → eh/e
  'o': { 1: 'o', 4: 'oh', 8: 'ah' },        // boat → baht
  'o_cvce': { 1: 'o', 4: 'oh', 8: 'ah' },    // lone → lohn → lahn (CVCe context)
  'ʊ': { 1: 'oo', 4: 'uh', 8: 'ah' },       // book → bahk
  'u': { 1: 'oo', 4: 'oh', 8: 'ah' },       // boot → baht

  // Diphthongs - emphasize first vowel
  'aɪ': { 1: 'ai', 4: 'ah', 8: 'ah' },      // bite → baht
  'aʊ': { 1: 'ow', 4: 'ah', 8: 'ah' },      // bout → baht
  'ɔɪ': { 1: 'oy', 4: 'oh', 8: 'ah' },      // boy → bah
  'eɪ': { 1: 'ay', 4: 'eh', 8: 'ae' },      // bait → baeht
  'oʊ': { 1: 'oh', 4: 'oh', 8: 'ah' }       // boat → baht
};

// Context-sensitive consonant rules
export const consonantRules: ConsonantRules = {
  't': {
    syllableInitial: { 1: 't', 4: 't', 8: 'd' },
    intervocalic: { 1: 't', 4: 'd', 8: 'd' },
    syllableFinal: { 1: 't', 4: 'd', 8: '' },
    beforeConsonant: { 1: 't', 4: 'd', 8: 'd' }
  },
  'k': {
    syllableInitial: { 1: 'k', 4: 'g', 8: 'g' },
    intervocalic: { 1: 'k', 4: 'g', 8: 'g' },
    syllableFinal: { 1: 'k', 4: 'g', 8: 'g' },
    beforeConsonant: { 1: 'k', 4: 'g', 8: 'g' }
  },
  'p': {
    syllableInitial: { 1: 'p', 4: 'b', 8: 'b' },
    intervocalic: { 1: 'p', 4: 'b', 8: 'b' },
    syllableFinal: { 1: 'p', 4: 'b', 8: 'b' }
  },
  'f': {
    syllableInitial: { 1: 'f', 4: 'v', 8: 'v' },
    intervocalic: { 1: 'f', 4: 'v', 8: 'v' },
    syllableFinal: { 1: 'f', 4: 'v', 8: 'v' }
  },
  's': {
    syllableInitial: { 1: 's', 4: 's', 8: 'z' },
    intervocalic: { 1: 's', 4: 'z', 8: 'z' },
    syllableFinal: { 1: 's', 4: 'z', 8: 'z' },
    beforeConsonant: { 1: 's', 4: 's', 8: 'z' }
  },
  'g': {
    syllableInitial: { 1: 'g', 4: 'g', 8: 'g' },
    intervocalic: { 1: 'g', 4: 'g', 8: 'g' },
    syllableFinal: { 1: 'g', 4: 'g', 8: 'g' }
  },
  'b': {
    syllableInitial: { 1: 'b', 4: 'b', 8: 'b' },
    intervocalic: { 1: 'b', 4: 'b', 8: 'b' },
    syllableFinal: { 1: 'b', 4: 'b', 8: 'b' }
  },
  'd': {
    syllableInitial: { 1: 'd', 4: 'd', 8: 'd' },
    intervocalic: { 1: 'd', 4: 'd', 8: 'd' },
    syllableFinal: { 1: 'd', 4: 'd', 8: '' }
  },
  'j': {
    syllableInitial: { 1: 'j', 4: 'j', 8: 'zh' },
    intervocalic: { 1: 'j', 4: 'zh', 8: 'zh' },
    syllableFinal: { 1: 'j', 4: 'zh', 8: 'zh' }
  },
  'v': {
    syllableInitial: { 1: 'v', 4: 'v', 8: 'v' },
    intervocalic: { 1: 'v', 4: 'v', 8: 'v' },
    syllableFinal: { 1: 'v', 4: 'v', 8: 'v' }
  },
  'z': {
    syllableInitial: { 1: 'z', 4: 'z', 8: 'z' },
    intervocalic: { 1: 'z', 4: 'z', 8: 'z' },
    syllableFinal: { 1: 'z', 4: 'z', 8: 'z' }
  }
};

// Morphological patterns
export const morphemePatterns: MorphemePatterns = {
  suffixes: {
    'ing': { 1: 'ing', 4: 'eeng', 8: 'ahng' },
    'ed': { 1: 'ed', 4: 'd', 8: 'd' },
    'er': { 1: 'er', 4: 'uhr', 8: 'ahr' },
    'est': { 1: 'est', 4: 'ehst', 8: 'ahst' },
    'ly': { 1: 'ly', 4: 'leh', 8: 'leh' },
    'tion': { 1: 'tion', 4: 'shun', 8: 'shahn' },
    'sion': { 1: 'sion', 4: 'zhuhn', 8: 'zhahn' },
    'ness': { 1: 'ness', 4: 'nehs', 8: 'nahs' },
    'ment': { 1: 'ment', 4: 'mehnt', 8: 'mahnt' },
    'ful': { 1: 'ful', 4: 'fool', 8: 'fahl' },
    'less': { 1: 'less', 4: 'lehs', 8: 'lahs' },
    'able': { 1: 'able', 4: 'uhbuhl', 8: 'ahbahl' },
    'ible': { 1: 'ible', 4: 'uhbuhl', 8: 'ahbahl' },
    'ies': { 1: 'ies', 4: 'aez', 8: 'ahz' },
    'in\'': { 1: 'in\'', 4: 'ehn\'', 8: 'ahn\'' }
  },
  prefixes: {
    'un': { 1: 'un', 4: 'uhn', 8: 'ahn' },
    're': { 1: 're', 4: 'ree', 8: 'rae' },
    'pre': { 1: 'pre', 4: 'pree', 8: 'brae' },
    'dis': { 1: 'dis', 4: 'dihs', 8: 'dahs' },
    'over': { 1: 'over', 4: 'oh-vuhr', 8: 'ah-vahr' },
    'any': { 1: 'a-ny', 4: 'eh-neh', 8: 'ah-nah' }
  }
};

// Common phonetic patterns with intensity-based transformations
export const phoneticPatterns: PhoneticPattern = {
  'ph': { 1: 'f', 4: 'f', 8: 'f' },
  'gh': { 1: '', 4: '', 8: '' }, // usually silent in modern English
  'ch': { 1: 'ch', 4: 'ch', 8: 'ch' },
  'th': { 1: 'th', 4: 'th', 8: 'd' }, // TH→D at highest intensity
  'sh': { 1: 'sh', 4: 'sh', 8: 'zh' }, // SH→ZH at highest intensity
  'wh': { 1: 'w', 4: 'w', 8: 'w' },
  'ck': { 1: 'k', 4: 'k', 8: 'g' },
  'dge': { 1: 'j', 4: 'j', 8: 'zh' },
  'tch': { 1: 'ch', 4: 'ch', 8: 'ch' },

  // Consonant clusters
  'nds': { 1: 'nds', 4: 'nz', 8: 'nz' }, // simplify at moderate/full
  'nts': { 1: 'nts', 4: 'ns', 8: 'ns' }, // simplify at moderate/full
  'lds': { 1: 'lds', 4: 'lz', 8: 'lz' }, // simplify at moderate/full
  'rds': { 1: 'rds', 4: 'rz', 8: 'rz' }, // simplify at moderate/full
  'mps': { 1: 'mps', 4: 'ms', 8: 'ms' }, // simplify at moderate/full
  'nks': { 1: 'nks', 4: 'ngs', 8: 'ngs' }, // simplify at moderate/full
  'sts': { 1: 'sts', 4: 'ss', 8: 's' }, // progressive simplification
  'sks': { 1: 'sks', 4: 'sks', 8: 'ss' }, // simplify at full
  'st$': { 1: 'st', 4: 'zt', 8: 'zd' }, // final st cluster: most, rest, etc.
  'ill$': { 1: 'ill', 4: 'ehl', 8: 'ahl' }, // final ill pattern: fill, hill, bill
  'll$': { 1: 'll', 4: 'l', 8: 'w' }, // double l at end: well, bell, tell
  'ss$': { 1: 'ss', 4: 'ss', 8: 'z' }, // double s at end: this, kiss, miss
  'ty$': { 1: 'ty', 4: 'tae', 8: 'teh' }, // -ty ending: city, pretty, party
  'ight$': { 1: 'ight', 4: 'aed', 8: 'nahd' }, // -ight ending: night, light, right, fight
  'where$': { 1: 'where', 4: 'wehr', 8: 'wahr' } // where ending: somewhere, nowhere
};

// Initial consonant cluster transformations
export const initialClusters: InitialCluster = {
  'sc': { 1: 'sc', 4: 'sc', 8: 'z' },   // SC→S (already handled in silent patterns)
  'sp': { 1: 'sp', 4: 'sp', 8: 'zb' },   // SP→B at highest intensity
  'st': { 1: 'st', 4: 'st', 8: 'zd' },   // ST→D at highest intensity
  'sw': { 1: 'sw', 4: 'sw', 8: 'zw' },   // SW→W at highest intensity
  'sn': { 1: 'sn', 4: 'sn', 8: 'zn' },   // SN→N at highest intensity
  'sl': { 1: 'sl', 4: 'sl', 8: 'zl' },   // SL→L at highest intensity
  'sk': { 1: 'sk', 4: 'sk', 8: 'zg' },   // SK→G at highest intensity
  'sm': { 1: 'sm', 4: 'sm', 8: 'zm' },   // SM→ZM at highest intensity
  'spr': { 1: 'spr', 4: 'spr', 8: 'zbr' }, // SPR→ZBR at highest intensity
  'str': { 1: 'str', 4: 'str', 8: 'zdr' }, // STR→ZDR at highest intensity
  'scr': { 1: 'scr', 4: 'scr', 8: 'zgr' }  // SCR→ZGR at highest intensity
};

// Vowel patterns with context
export const vowelPatterns: VowelPatterns = {
  'ee': { sound: 'i', context: 'long_e' },
  'ea': { sound: 'i', context: 'long_e' },
  'ie': { sound: 'i', context: 'long_e' },
  'oo': { sound: 'u', context: 'long_u' },
  'ou': { sound: 'aʊ', context: 'diphthong' },
  'ow': { sound: 'aʊ', context: 'diphthong' },
  'ai': { sound: 'eɪ', context: 'diphthong' },
  'ay': { sound: 'eɪ', context: 'diphthong' },
  'ey': { sound: 'eɪ', context: 'diphthong' },
  'oi': { sound: 'ɔɪ', context: 'diphthong' },
  'oy': { sound: 'ɔɪ', context: 'diphthong' },
  'au': { sound: 'ɔ', context: 'long_o' },
  'aw': { sound: 'ɔ', context: 'long_o' }
};

// Silent letter patterns
export const silentPatterns: { [key: string]: string } = {
  'mb$': 'm',     // lamb, thumb
  'ght': 't',     // night, light
  'kn': 'n',      // knife, know
  'wr': 'r',      // write, wrong
  'gn': 'n',      // sign, design
  'bt$': 't',     // debt, doubt
  'sc': 's',      // scene, science (if not caught by initial cluster)
  'ps': 's',      // psalm, psychology
  'rh': 'r'       // rhyme, rhythm
};