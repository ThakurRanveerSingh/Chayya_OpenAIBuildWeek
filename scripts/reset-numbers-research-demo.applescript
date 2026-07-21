-- Clears only the prepared output rows in the saved Anukriti demo workbook.
-- It refuses to touch a different front document or a differently named table.
tell application "Numbers"
  if not (exists front document) then error "Open Anukriti-Numbers-Research-Demo.numbers first."
  set targetDocument to front document
  if name of targetDocument is not "Anukriti-Numbers-Research-Demo.numbers" then error "The Anukriti demo workbook must be the front document."
  set targetSheet to active sheet of targetDocument
  if not (exists table "Anukriti Research Results" of targetSheet) then error "The demo results table is missing."
  set targetTable to table "Anukriti Research Results" of targetSheet
  repeat with rowNumber from 2 to (row count of targetTable)
    repeat with columnNumber from 1 to 6
      set value of cell columnNumber of row rowNumber of targetTable to ""
    end repeat
  end repeat
  save targetDocument
end tell
