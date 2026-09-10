import { ingestCsvRace, ingestJsonRace, ingestManualRace } from './ingest';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(fn: () => unknown, contains: string): void {
  try { fn(); } catch (error) {
    assert(error instanceof Error && error.message.includes(contains), `expected error containing: ${contains}`);
    return;
  }
  throw new Error(`expected throw containing: ${contains}`);
}

const manual = ingestManualRace({
  id: 'synthetic-race',
  segments: [
    { id: 'run-1', kind: 'run', durationSeconds: 240 },
    { id: 'station-1', kind: 'station', label: 'Synthetic, "station"', durationSeconds: 90 },
    { id: 'transition-1', kind: 'transition', durationSeconds: 30 },
  ],
});
assert(manual.segments.length === 3, 'manual ingestion must preserve all segments');
assert(manual.segments[0].label === 'run-1', 'missing labels must deterministically default to segment id');

const json = ingestJsonRace(JSON.stringify({ id: manual.id, segments: manual.segments.map(({ id, kind, label, durationSeconds }) => ({ id, kind, label, durationSeconds })) }));
assert(JSON.stringify(json) === JSON.stringify(manual), 'manual and JSON ingestion must canonicalize equivalent inputs identically');

const csv = ingestCsvRace('synthetic-race', 'id,kind,label,durationSeconds\nrun-1,run,,240\nstation-1,station,"Synthetic, ""station""",90\ntransition-1,transition,,30\n');
assert(JSON.stringify(csv) === JSON.stringify(manual), 'manual, JSON, and CSV ingestion must canonicalize equivalent inputs identically');
assert(csv.segments.map((segment) => segment.id).join(',') === 'run-1,station-1,transition-1', 'CSV ingestion must preserve row order');

expectThrow(() => ingestJsonRace('{'), 'invalid race JSON');
expectThrow(() => ingestJsonRace('[]'), 'race JSON must be an object');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'bike', durationSeconds: 1 }] })), 'segment kind');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'run', durationSeconds: '1' }] })), 'durationSeconds');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'run', durationSeconds: -1 }] })), 'invalid duration');
expectThrow(() => ingestJsonRace(JSON.stringify({ id: 'x', segments: [{ id: 'a', kind: 'run', durationSeconds: 1 }, { id: 'a', kind: 'run', durationSeconds: 2 }] })), 'duplicate segment id');
expectThrow(() => ingestCsvRace('x', 'id,kind,label,durationSeconds'), 'header and at least one segment');
expectThrow(() => ingestCsvRace('x', 'kind,id,label,durationSeconds\nrun,a,,1'), 'CSV header');
expectThrow(() => ingestCsvRace('x', 'id,kind,label,durationSeconds\na,run,,nope'), 'durationSeconds must be numeric');
expectThrow(() => ingestCsvRace('x', 'id,kind,label,durationSeconds\na,bike,,1'), 'segment kind');
expectThrow(() => ingestCsvRace('x', 'id,kind,label,durationSeconds\na,run,,1\na,run,,2'), 'duplicate segment id');
expectThrow(() => ingestCsvRace('x', 'id,kind,label,durationSeconds\na,run,"broken,1'), 'unterminated CSV quote');
expectThrow(() => ingestCsvRace('x', 'id,kind,label,durationSeconds\na,run,,1,extra'), 'must contain 4 fields');

console.log('ingestion contracts passed');
