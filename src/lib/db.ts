import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'election.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT,
    constituency_name TEXT,
    constituency_no INTEGER,
    district TEXT,
    party TEXT,
    votes INTEGER,
    vote_share REAL,
    age INTEGER,
    education TEXT
  );

  CREATE TABLE IF NOT EXISTS affidavits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT,
    constituency_name TEXT,
    criminal_cases INTEGER,
    assets INTEGER,
    liabilities INTEGER,
    education TEXT
  );
`);

// Auto-seed data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM candidates').get() as { count: number };
if (count.count === 0) {
  try {
    const csvPath = path.join(process.cwd(), '../../report.csv');
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const records = parse(csvData, { columns: true, skip_empty_lines: true });

      const stmt = db.prepare(`
        INSERT INTO candidates (
          candidate_name, constituency_name, constituency_no, district, party, votes, vote_share, age, education
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((records) => {
        for (const record of records) {
          const name = record.Candidate || record.candidate_name;
          const constituency = record.Constituency_Name || record.constituency_name;
          const constituency_no = parseInt(record.Constituency_No || record.constituency_no) || 0;
          const district = record.District_Name || record.district;
          const party = record.Party || record.party;
          const votes = parseInt(record.Votes || record.votes) || 0;
          const vote_share = parseFloat(record.Vote_Share_Percentage || record.vote_share) || 0;
          const age = parseInt(record.Age || record.age) || 0;
          const education = record.MyNeta_education || record.education || "";

          stmt.run(name, constituency, constituency_no, district, party, votes, vote_share, age, education);
        }
      });

      insertMany(records);
      console.log('Successfully seeded database with report.csv');
    } else {
      console.warn('report.csv not found at', csvPath);
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
}

export default db;
