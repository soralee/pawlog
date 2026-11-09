const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const FINAL_CONSONANT_COUNT = 28;

/** 끝 글자의 받침 유무로 목적격 조사(을/를)를 붙인다. 끝 글자가 한글 음절이 아니면 "을(를)"을 붙인다. */
export function withObjectParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  if (!(code >= HANGUL_SYLLABLE_START && code <= HANGUL_SYLLABLE_END)) return `${word}을(를)`;
  const hasFinalConsonant = (code - HANGUL_SYLLABLE_START) % FINAL_CONSONANT_COUNT !== 0;
  return `${word}${hasFinalConsonant ? '을' : '를'}`;
}
