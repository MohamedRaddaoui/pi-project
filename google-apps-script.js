// Google Apps Script to update the Sentiment Analysis sheet
// Copy and paste this code into the Apps Script editor

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Sheet not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Clear the existing content (optional)
    sheet.clear();
    
    // Add headers
    const headers = [
      "Question Title",
      "Content",
      "Frequency",
      "Sentiment Score",
      "Comparative Score",
      "Views",
      "Vote Score",
      "Created At"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Check if we have data to add
    if (!data.rows || data.rows.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Headers added but no data rows provided"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prepare the data rows
    const rows = data.rows.map(row => [
      row.title,
      row.content,
      row.frequency,
      row.sentimentScore,
      row.comparative,
      row.views,
      row.voteScore,
      row.createdAt
    ]);
    
    // Add the data to the sheet
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Sheet updated successfully",
      updatedRows: rows.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// This function is needed to test the web app
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Sentiment Analysis API is running. Use POST to update the sheet."
  })).setMimeType(ContentService.MimeType.JSON);
}
