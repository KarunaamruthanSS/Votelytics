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
      INSERT INTO affidavits (
        candidate_name,
        constituency_name,
        criminal_cases,
        assets,
        liabilities,
        education
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records) => {
      db.prepare(`DELETE FROM affidavits`).run();

      for (const record of records) {
        const name = record.candidate_name || record.Candidate;
        const constituency = record.constituency_name || record.Constituency_Name;
        const criminal_cases = parseInt(record.criminal_cases || record.Criminal_Cases) || 0;
        const assets = parseInt(record.assets || record.Assets) || 0;
        const liabilities = parseInt(record.liabilities || record.Liabilities) || 0;
        const education = record.education || record.Education || "";

        stmt.run(name, constituency, criminal_cases, assets, liabilities, education);
      }
    });

    insertMany(records);

    return NextResponse.json({ message: "Affidavit dataset uploaded successfully", count: records.length });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
