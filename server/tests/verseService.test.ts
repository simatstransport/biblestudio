import test from 'node:test';
import assert from 'node:assert';
import { VerseService, CANONICAL_VERSES } from '../src/services/verseService.js';

test('Verse Service Canonical Verification', async (t) => {
  await t.test('should load verified canonical verses in English and Tamil', async () => {
    const faithVerses = await VerseService.getVersesByTopic('faith');
    assert.ok(faithVerses.length >= 2);

    const heb11 = faithVerses.find(v => v.reference === 'Hebrews 11:1');
    assert.ok(heb11);
    assert.strictEqual(heb11.isVerified, true);
    assert.ok(heb11.english.text.includes('Now faith is the substance'));
    assert.ok(heb11.tamil.text.includes('விசுவாசமானது'));
  });

  await t.test('should find verses by reference case-insensitively', async () => {
    const verse = await VerseService.findByReference('jeremiah 29:11');
    assert.ok(verse);
    assert.strictEqual(verse.book, 'Jeremiah');
    assert.strictEqual(verse.chapter, 29);
    assert.strictEqual(verse.verseStart, 11);
  });

  await t.test('should return null for non-canonical or unverified verse references', async () => {
    const missing = await VerseService.findByReference('FakeBook 99:99');
    assert.strictEqual(missing, null);
  });
});
