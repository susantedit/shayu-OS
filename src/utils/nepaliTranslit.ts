/**
 * Nepali Phonetic Romanized-to-Devanagari Transliteration Utility
 * Handcrafted for स्याउ OS (SyauOS) by Kantaraj Luitel (Susant).
 * 
 * Supports phonetic mapping, syllable conjuncts, matras, halant,
 * and a dictionary of common conversational words for natural typing.
 */

// Common direct word overrides for natural typing flow
const WORD_MAP: Record<string, string> = {
  'namaste': 'नमस्ते',
  'namaskar': 'नमस्कार',
  'syau': 'स्याउ',
  'nepal': 'नेपाल',
  'nepali': 'नेपाली',
  'sathi': 'साथी',
  'sathiharu': 'साथीहरू',
  'k': 'के',
  'cha': 'छ',
  'chha': 'छ',
  'chaina': 'छैन',
  'ho': 'हो',
  'haina': 'हैन',
  'mero': 'मेरो',
  'naam': 'नाम',
  'timro': 'तिम्रो',
  'tapai': 'तपाईं',
  'tapaiko': 'तपाईंको',
  'ramro': 'राम्रो',
  'dhanyabad': 'धन्यवाद',
  'swagatam': 'स्वागतम्',
  'ghar': 'घर',
  'pani': 'पानी',
  'khana': 'खाना',
  'kaam': 'काम',
  'bidesh': 'विदेश',
  'desh': 'देश',
  'manxe': 'मान्छे',
  'manche': 'मान्छे',
  'bhat': 'भात',
  'mitho': 'मीठो',
  'subhapravat': 'शुभप्रभात',
  'subhadin': 'शुभदिन',
  'bholi': 'भोली',
  'aaja': 'आज',
  'hijo': 'हिजो',
  'kati': 'कति',
  'kina': 'किन',
  'kaha': 'कहाँ',
  'kasari': 'कसरी',
  'kahile': 'कहिले',
  'sabai': 'सबै',
  'dherai': 'धेरै',
  'thorai': 'थोरै',
  'thik': 'ठीक',
  'thikcha': 'ठीक छ',
  'paisa': 'पैसा',
  'hunchha': 'हुन्छ',
  'huncha': 'हुन्छ',
  'gardai': 'गर्दै',
  'chu': 'छु',
  'chhu': 'छु',
  'thiye': 'थिएँ',
  'thiyo': 'थियो',
  'jasle': 'जसले',
  'tyasle': 'त्यसले',
  'hackclub': 'ह्याक क्लब',
  'susant': 'सुशान्त',
  'kantaraj': 'कान्तराज',
  'rohan': 'रोहन',
}

// Multi-character consonant patterns (longest match first)
const CONSONANTS: Record<string, string> = {
  'chh': 'छ',
  'shh': 'ष',
  'gya': 'ज्ञ',
  'ksh': 'क्ष',
  'tra': 'त्र',
  'kh': 'ख',
  'gh': 'घ',
  'ng': 'ङ',
  'ch': 'च',
  'jh': 'झ',
  'yn': 'ञ',
  'th': 'थ',
  'dh': 'ध',
  'ph': 'फ',
  'bh': 'भ',
  'sh': 'श',
  'k': 'क',
  'g': 'ग',
  'j': 'ज',
  't': 'त',
  'd': 'द',
  'n': 'न',
  'p': 'प',
  'f': 'फ',
  'b': 'ब',
  'm': 'म',
  'y': 'य',
  'r': 'र',
  'l': 'ल',
  'v': 'व',
  'w': 'व',
  's': 'स',
  'h': 'ह',
}

// Vowels standalone
const INDEPENDENT_VOWELS: Record<string, string> = {
  'aa': 'आ',
  'ee': 'ई',
  'oo': 'ऊ',
  'ai': 'ऐ',
  'au': 'औ',
  'ri': 'ऋ',
  'a': 'अ',
  'i': 'इ',
  'u': 'उ',
  'e': 'ए',
  'o': 'ओ',
}

// Dependent vowel signs (matras) attached to consonants
const MATRAS: Record<string, string> = {
  'aa': 'ा',
  'ee': 'ी',
  'oo': 'ू',
  'ai': 'ै',
  'au': 'ौ',
  'ri': 'ृ',
  'a': '',
  'i': 'ि',
  'u': 'ु',
  'e': 'े',
  'o': 'ो',
}

/**
 * Transliterates an individual romanized word to Devanagari
 */
export function transliterateWord(rawWord: string): string {
  if (!rawWord) return ''

  const clean = rawWord.toLowerCase()
  if (WORD_MAP[clean]) {
    return WORD_MAP[clean]
  }

  let result = ''
  let i = 0
  const len = clean.length

  while (i < len) {
    const ch = clean[i]

    if (!/[a-z]/.test(ch)) {
      result += ch
      i++
      continue
    }

    let foundConsonant = ''
    let consonantKey = ''

    for (const testLen of [3, 2, 1]) {
      if (i + testLen <= len) {
        const sub = clean.slice(i, i + testLen)
        if (CONSONANTS[sub]) {
          foundConsonant = CONSONANTS[sub]
          consonantKey = sub
          break
        }
      }
    }

    if (foundConsonant) {
      i += consonantKey.length

      let foundMatra: string | null = null
      let matraKey = ''

      for (const vLen of [2, 1]) {
        if (i + vLen <= len) {
          const subV = clean.slice(i, i + vLen)
          if (MATRAS[subV] !== undefined) {
            foundMatra = MATRAS[subV]
            matraKey = subV
            break
          }
        }
      }

      if (foundMatra !== null) {
        result += foundConsonant + foundMatra
        i += matraKey.length
      } else {
        if (i < len && /[a-z]/.test(clean[i])) {
          result += foundConsonant + '्'
        } else {
          result += foundConsonant
        }
      }
      continue
    }

    let foundVowel = ''
    let vowelKey = ''

    for (const vLen of [2, 1]) {
      if (i + vLen <= len) {
        const subV = clean.slice(i, i + vLen)
        if (INDEPENDENT_VOWELS[subV]) {
          foundVowel = INDEPENDENT_VOWELS[subV]
          vowelKey = subV
          break
        }
      }
    }

    if (foundVowel) {
      result += foundVowel
      i += vowelKey.length
      continue
    }

    result += ch
    i++
  }

  return result
}

/**
 * Transliterates a full block of text preserving spaces and newlines
 */
export function transliterateText(input: string): string {
  if (!input) return ''

  const tokens = input.split(/(\s+|[.,!?;:()[\]{}<>"/\\-])/)
  return tokens.map(token => {
    if (!token || /^\s+$/.test(token) || /^[.,!?;:()[\]{}<>"/\\-]+$/.test(token)) {
      return token
    }
    return transliterateWord(token)
  }).join('')
}
