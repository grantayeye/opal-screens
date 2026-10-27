const assert = require('node:assert/strict');
const test = require('node:test');
const {z} = require('zod');

// CVE-2023-54404: bounded collections must reject before parsing any elements.
// Small inputs make the regression deterministic without exhausting memory.
for (const [name, makeSchema, input] of [
  ['array max', element => z.array(element).max(1), ['a', 'b']],
  ['array length', element => z.array(element).length(1), ['a', 'b']],
  ['set max', element => z.set(element).max(1), new Set(['a', 'b'])],
  ['set size', element => z.set(element).size(1), new Set(['a', 'b'])],
  ['map max', element => z.map(element, element).max(1), new Map([['a', 'b'], ['c', 'd']])],
  ['map size', element => z.map(element, element).size(1), new Map([['a', 'b'], ['c', 'd']])]
]) {
  test(`${name} rejects oversized input before element validation`, async () => {
    let visits = 0;
    const schema = makeSchema(z.string().superRefine(() => visits++));
    for (const result of [schema.safeParse(input), await schema.safeParseAsync(input)]) {
      assert.equal(result.success, false);
      assert.deepEqual(result.error.issues.map(issue => issue.code), ['too_big']);
    }
    assert.equal(visits, 0);
  });
}

test('bounded collections still validate allowed elements', () => {
  const schemas = [
    [z.array(z.string()).max(1), ['a'], [0]],
    [z.set(z.string()).max(1), new Set(['a']), new Set([0])],
    [z.map(z.string(), z.string()).max(1), new Map([['a', 'b']]), new Map([[0, 1]])]
  ];
  for (const [schema, valid, invalid] of schemas) {
    assert.equal(schema.safeParse(valid).success, true);
    assert.equal(schema.safeParse(invalid).success, false);
  }
});

test('BiDi parser accepts valid input and rejects invalid input with Zod 4', async () => {
  const {Browser} = await import('chromium-bidi/out/Default/gen/src/protocol-parser/protocol-parser.js');
  assert.deepEqual(Browser.parseRemoveUserContextParameters({userContext: 'qa-context'}), {userContext: 'qa-context'});
  assert.throws(() => Browser.parseRemoveUserContextParameters({userContext: 0}), {
    error: 'invalid argument',
    message: /userContext/
  });
});
