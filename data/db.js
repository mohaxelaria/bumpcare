import * as SQLite from 'expo-sqlite';

// Lazily opened, shared across the whole app.
let dbPromise = null;

// New columns for the screening flow (fetal presentation / measurements /
// risk-factor result). Added as an idempotent migration so existing
// installs (which already have the original monitoring-only table) pick
// them up without losing previously saved sessions.
const MIGRATION_COLUMNS = [
  "ALTER TABLE sessions ADD COLUMN type TEXT DEFAULT 'monitoring'",
  'ALTER TABLE sessions ADD COLUMN presentation TEXT',
  'ALTER TABLE sessions ADD COLUMN presentationConfidence INTEGER',
  'ALTER TABLE sessions ADD COLUMN bpd INTEGER',
  'ALTER TABLE sessions ADD COLUMN hc INTEGER',
  'ALTER TABLE sessions ADD COLUMN scanQuality TEXT',
  'ALTER TABLE sessions ADD COLUMN sizeRiskFlag TEXT',
  'ALTER TABLE sessions ADD COLUMN screeningResult TEXT',
];

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('bumpcare.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          durationSeconds INTEGER NOT NULL,
          deviceName TEXT NOT NULL,
          batteryEnd INTEGER,
          contactQuality TEXT,
          stability TEXT,
          signalQuality INTEGER,
          movement TEXT,
          pressureRange TEXT,
          notes TEXT,
          pressureSeries TEXT,
          movementSeries TEXT,
          packetsReceived INTEGER
        );
      `);

      for (const statement of MIGRATION_COLUMNS) {
        try {
          await db.execAsync(statement);
        } catch (err) {
          // Column already exists from a previous run — fine to ignore.
        }
      }

      return db;
    });
  }
  return dbPromise;
}

function parseRow(row) {
  return {
    ...row,
    type: row.type || 'monitoring',
    pressureSeries: JSON.parse(row.pressureSeries || '[]'),
    movementSeries: JSON.parse(row.movementSeries || '[]'),
  };
}

export async function insertSession(session) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO sessions (
      id, date, durationSeconds, deviceName, batteryEnd,
      contactQuality, stability, signalQuality, movement, pressureRange,
      notes, pressureSeries, movementSeries, packetsReceived,
      type, presentation, presentationConfidence, bpd, hc,
      scanQuality, sizeRiskFlag, screeningResult
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    session.id,
    session.date,
    session.durationSeconds,
    session.deviceName,
    session.batteryEnd,
    session.contactQuality ?? null,
    session.stability ?? null,
    session.signalQuality ?? null,
    session.movement ?? null,
    session.pressureRange ?? null,
    session.notes ?? null,
    JSON.stringify(session.pressureSeries || []),
    JSON.stringify(session.movementSeries || []),
    session.packetsReceived ?? null,
    session.type || 'monitoring',
    session.presentation ?? null,
    session.presentationConfidence ?? null,
    session.bpd ?? null,
    session.hc ?? null,
    session.scanQuality ?? null,
    session.sizeRiskFlag ?? null,
    session.screeningResult ?? null
  );
}

export async function getAllSessions() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT * FROM sessions ORDER BY date DESC');
  return rows.map(parseRow);
}

export async function getSessionById(id) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM sessions WHERE id = ?', id);
  return row ? parseRow(row) : null;
}

export async function deleteSession(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM sessions WHERE id = ?', id);
}
