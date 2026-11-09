import { withObjectParticle } from './korean';

test.each([
  ['나비', '나비를'],
  ['보리', '보리를'],
  ['초코', '초코를'],
  ['콩', '콩을'],
  ['몽실이 밥', '몽실이 밥을'],
])('받침 유무로 목적격 조사를 고른다: %s → %s', (word, expected) => {
  expect(withObjectParticle(word)).toBe(expected);
});

test.each([['Coco'], ['나비2'], ['']])(
  '끝 글자가 한글 음절이 아니면 을(를)을 유지한다: "%s"',
  (word) => {
    expect(withObjectParticle(word)).toBe(`${word}을(를)`);
  },
);
