-- Creates a local Numbers template for the Anukriti desktop demo.
-- It only creates the file path explicitly supplied as its first argument.
on run argv
  if (count of argv) is not 1 then error "Provide one new .numbers destination path."
  set destinationFile to POSIX file (item 1 of argv)
  tell application "Numbers"
  activate
  set demoDocument to make new document
  tell active sheet of demoDocument
    set inputTable to table 1
    set name of inputTable to "Anukriti Research Input"
    set value of cell 1 of row 1 of inputTable to "Search term"
    set value of cell 2 of row 1 of inputTable to "Metric"
    set value of cell 1 of row 2 of inputTable to "Flowood MS"
    set value of cell 2 of row 2 of inputTable to "Median home price"
    set value of cell 1 of row 3 of inputTable to "AAPL"
    set value of cell 2 of row 3 of inputTable to "Momentum score"

    set resultsTable to make new table at end of tables with properties {name:"Anukriti Research Results"}
    repeat with columnNumber from 1 to 5
      add column after last column of resultsTable
    end repeat
    repeat with rowNumber from 1 to 25
      add row below last row of resultsTable
    end repeat
    set outputHeaders to {"Search term", "Metric", "Value", "Source URL", "Checked at", "Status"}
    repeat with columnNumber from 1 to 6
      set value of cell columnNumber of row 1 of resultsTable to item columnNumber of outputHeaders
    end repeat
    end tell
    save demoDocument in destinationFile
  end tell
  return item 1 of argv
end run
