import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { parse } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const csvData = Buffer.from(fileBuffer).toString("utf-8");

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    });

    if (records.length === 0) {
      return NextResponse.json({ error: "Empty CSV file" }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO candidates (
        candidate_name,
        constituency_name,
        constituency_no,
        district,
        party,
        votes,
        vote_share,
        age,
        education
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records) => {
      // Clear existing records safely before inserting this dataset since it's an overwrite
      db.prepare(`DELETE FROM candidates`).run();

      for (const record of records) {
        // TCPD mapping
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

    return NextResponse.json({ message: "Main dataset uploaded successfully", count: records.length });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
