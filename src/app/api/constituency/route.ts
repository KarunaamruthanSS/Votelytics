import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const search = searchParams.get("search");
  const year = searchParams.get("year");

  try {
    if (name && year) {
      // Detailed view for a specific constituency and year
      const data = db.prepare(`
        SELECT 
          c.id, c.candidate_name, c.constituency_name, c.constituency_no, 
          c.district, c.party, c.votes, c.vote_share, c.age, c.year,
          COALESCE(a.education, c.education) AS education,
          a.criminal_cases, a.assets, a.liabilities
        FROM candidates c
        LEFT JOIN affidavits a 
          ON UPPER(TRIM(c.candidate_name)) = UPPER(TRIM(a.candidate_name))
         AND UPPER(TRIM(c.constituency_name)) = UPPER(TRIM(a.constituency_name))
        WHERE UPPER(c.constituency_name) = UPPER(?) AND c.year = ?
        ORDER BY c.votes DESC
      `).all(name.trim(), parseInt(year));

      return NextResponse.json({ candidates: data });
    }

    if (name) {
      // Get winners for all years for a constituency
      const winners = db.prepare(`
        SELECT 
          c.candidate_name, c.party, c.votes, c.vote_share, c.year, c.district, c.constituency_no
        FROM candidates c
        WHERE UPPER(c.constituency_name) = UPPER(?)
        AND c.votes = (
          SELECT MAX(votes) 
          FROM candidates 
          WHERE UPPER(constituency_name) = UPPER(c.constituency_name) 
          AND year = c.year
        )
        ORDER BY c.year ASC
      `).all(name.trim());

      return NextResponse.json({ winners });
    }

    if (search !== null) {
      // Autocomplete search for constituency names
      const searchTerm = `%${search.toUpperCase()}%`;
      const data = db.prepare(`
        SELECT DISTINCT constituency_name, district
        FROM candidates
        WHERE UPPER(constituency_name) LIKE ?
        ORDER BY constituency_name ASC
        LIMIT 20
      `).all(searchTerm);

      return NextResponse.json({ constituencies: data });
    }

    return NextResponse.json({ error: "Provide 'name', 'name' with 'year', or 'search' parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
