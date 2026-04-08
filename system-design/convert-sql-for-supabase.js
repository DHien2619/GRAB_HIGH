/**
 * convert-sql-for-supabase.js
 * 
 * Script này convert file SQL dump (pg_dump) sang format Supabase SQL Editor chấp nhận.
 * Nó sẽ:
 *   1. Xoá các lệnh ALTER TABLE ... OWNER TO postgres
 *   2. Convert COPY ... FROM stdin; ... \. thành INSERT INTO ... VALUES ...
 *   3. Xoá SET transaction_timeout, SET client_min_messages (không cần thiết)
 * 
 * Usage:
 *   node convert-sql-for-supabase.js <input.sql> <output.sql>
 * 
 * Ví dụ:
 *   node convert-sql-for-supabase.js shared_deli_full.sql supabase_auth.sql
 *   node convert-sql-for-supabase.js food_deli_full.sql supabase_food.sql
 */

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node convert-sql-for-supabase.js <input.sql> <output.sql>');
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
const outputPath = path.resolve(outputFile);

if (!fs.existsSync(inputPath)) {
  console.error(`File không tồn tại: ${inputPath}`);
  process.exit(1);
}

console.log(`Đang đọc: ${inputPath}`);
const raw = fs.readFileSync(inputPath, 'utf-8');
const lines = raw.split('\n');

const outputLines = [];
let i = 0;

// Các lệnh SET cần bỏ qua
const skipPatterns = [
  /^SET statement_timeout/,
  /^SET lock_timeout/,
  /^SET idle_in_transaction_session_timeout/,
  /^SET transaction_timeout/,
  /^SET client_encoding/,
  /^SET standard_conforming_strings/,
  /^SELECT pg_catalog\.set_config\('search_path'/,
  /^SET check_function_bodies/,
  /^SET xmloption/,
  /^SET client_min_messages/,
  /^SET row_security/,
  /^SET default_tablespace/,
  /^SET default_table_access_method/,
  /^ALTER.*OWNER TO/,
];

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();

  // Bỏ qua các lệnh không cần thiết
  if (skipPatterns.some(p => p.test(trimmed))) {
    i++;
    continue;
  }

  // Xử lý khối COPY ... FROM stdin
  const copyMatch = trimmed.match(/^COPY\s+([\w.]+)\s*\(([^)]+)\)\s*FROM stdin;$/i);
  if (copyMatch) {
    const tableName = copyMatch[1].replace('public.', '');
    const columns = copyMatch[2].split(',').map(c => c.trim());

    outputLines.push(`-- Chèn dữ liệu vào bảng ${tableName}`);
    i++;

    // Đọc từng dòng dữ liệu cho đến khi gặp '\.'
    while (i < lines.length && lines[i].trim() !== '\\.') {
      const dataLine = lines[i];
      if (dataLine.trim() === '') {
        i++;
        continue;
      }

      // Tách các cột theo tab
      const values = dataLine.split('\t');

      // Convert từng giá trị
      const sqlValues = values.map((val, idx) => {
        if (val === '\\N') return 'NULL';
        if (val === 't') return 'TRUE';
        if (val === 'f') return 'FALSE';

        // Kiểm tra xem có phải số không
        if (/^-?\d+(\.\d+)?$/.test(val)) return val;

        // Escape single quotes và wrap trong dấu nháy
        return `'${val.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
      });

      const colList = columns.map(c => `"${c}"`).join(', ');
      const valList = sqlValues.join(', ');
      outputLines.push(`INSERT INTO ${tableName} (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;`);

      i++;
    }
    i++; // bỏ qua dòng '\.'
    outputLines.push(''); // dòng trống
    continue;
  }

  // Giữ nguyên các dòng khác
  outputLines.push(line);
  i++;
}

const output = outputLines.join('\n');
fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`✅ Đã tạo file: ${outputPath}`);
console.log(`   Số dòng gốc: ${lines.length}`);
console.log(`   Số dòng kết quả: ${outputLines.length}`);
