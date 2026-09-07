import { ingestJsonRace, ingestManualRace } from './ingest';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(fn: () => unknown, contains: string): void {
  try {
    fn();
  } catch (error) {
    assert(error instanceof Error && error.message.includes(contains), `expected error containing: ${contains}`);
    return;
  }
  throw new Error(`expected throw containing: ${contains}`);
}

const manual = ingestManualRace({
  id: 'synthetic-race',
  segments: [
    { id: 'run-1', kind: 'run', durationSeconds: 240 },
    { id: 'station-1', kind: 'station', label: 'Synthetic station', durationSeconds: 90 },
    { id: 'transition-1', kind: 'transition', durationSeconds: 30 },
  ],
});
assert(manual.segments.length === 3, 'manual ingestion must preserve all segments');
assert(manual.segments[0].label === 'run-1', 'missing labels must deterministically default to segment id');

const json = ingestJsonRace(JSON.stringify({
  id: 'synthetic-race',
  segments: [
    { id: 'run-1', kind: 'run', durationSeconds: 240 },
    { id: 'station-1', kind: 'station', label: 'Synthetic station', durationSeconds: 90 },
    { id: 'transition-1', kind: 'transition', durationSeconds: 30 },
  ],
}));
assert(JSON.stringify(json) === JSON.stringify(manual), 'manual and JSON ingestion must canonicalize equivalent inputs identically');

expectThrow(() => ingestJsonRace('{'), 'invalid race JSON');
expectThrow(() => ingestJsonRace('[]'), 'race JSON must be an object');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'bike', durationSeconds: 1 }] })), 'segment kind');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'run', durationSeconds: '1' }] })), 'durationSeconds');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'run', durationSeconds: -1 }] })), 'invalid duration');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'run', durationSeconds: 1 }, { id: 'a', kind: 'run', durationSeconds: 2 }] })), 'duplicate segment id');

console.log('ingestion contracts passed');
