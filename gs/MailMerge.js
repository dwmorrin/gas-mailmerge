/**
 * Creates an example template.
 * Zeroes the margins and provides example of placeholders. 
 *
 * @returns Document
 */
function createNewTemplate_() {
  const doc = DocumentApp.create("Mail Merge Template");
  const body = doc.getBody();
  body.setMarginBottom(0).setMarginLeft(0).setMarginRight(0).setMarginTop(0);
  body.insertParagraph(0, "Dear {{name}},\n\nHere is your {{payload}}.\n\nBest,");
  return doc;
}

/**
 * @param Spreadsheet
 * @returns Sheet
 */
function createTestSheet_(spreadsheet) {
  const sheet = spreadsheet.insertSheet(config.TEST_SHEET_NAME);
  if (config.HEADER_ROWS > 0) {
    for (let key in config.columns) {
      sheet.getRange(config.HEADER_ROWS, config.columns[key]).setValue(key);
    }
  }
  for (let key in config.columns) {
    if (key == "EMAIL_SENT") continue;
    sheet.getRange(config.HEADER_ROWS + 1, config.columns[key])
      .setValue(key == "EMAIL" ? Session.getActiveUser().getEmail() : key + "_TEST_DATA");
  }
  return sheet;
}

/**
 * @returns {string} - Doc body in HTML
 */
function getGoogleDocumentAsHTML_() {
  DriveApp.getStorageUsed(); //needed to get Drive Scope requested
  const url = "https://docs.google.com/feeds/download/documents/export/Export?id=" +
        config.TEMPLATE_ID + "&exportFormat=html";
  const param = {
    method: "get",
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions:true,
  };
  return UrlFetchApp.fetch(url, param).getContentText();
}

/**
 * Uses config.index for 0 based indexing
 *
 * @param string[] row One row of data from a Sheet
 * @returns bool
 */
function emailFromRow_(row) {
  if (row[config.index.EMAIL_SENT]) {
    return false;
  }
  try {
    const mailOptions = {
      htmlBody: getGoogleDocumentAsHTML_().replace(/{{\s*([a-zA-Z_]+)\s*}}/g, (_, variable) => {
        return row[config.index[variable.toUpperCase()]];
      }),
      from: config.EMAIL_FROM,
      name: config.EMAIL_FROM_NAME,
    };
    GmailApp.sendEmail(row[config.index.EMAIL], config.EMAIL_SUBJECT, "", mailOptions);
    return true;
  } catch (error) { // log errors to https://script.google.com/home/executions
    console.error(error);
    console.info(row);
    return false;
  }
}

/**
 * This function can take a long time!  Gmail will throttle emailing and make your script wait.
 * Apps script has a limited execution time (6 minutes), therefore we keep track of what has been
 * emailed as we go with the EMAIL_SENT column.  If we need to re-run the script, the rows with
 * EMAIL_SEND will not be emailed again.
 *
 * @param Sheet A Google Sheet with email data
 */
function sendMail_(sheet) {
  const data = sheet.getDataRange().getValues();
  for (let index = config.HEADER_ROWS; index < data.length; ++index) {
    if (emailFromRow_(data[index]) && (! config.TESTING || config.MARK_TESTS_SENT)) {
      sheet.getRange(index + 1, config.columns.EMAIL_SENT).setValue(true);
    }
  }
}

// try to catch errors early and with helpful debugging messages
function validateConfiguration_() {
  const validString = string => typeof string == "string" && string != "";
  const validIndex = obj => {
    for (let key in obj) if (typeof obj[key] != "number") return false;
    return true;
  }
  const tests = [
    typeof config.TESTING == "boolean"         || "Please set TESTING to true or false",
    typeof config.AUTO_TEST == "boolean"       || "Please set AUTO_TEST to true or false",
    typeof config.MARK_TESTS_SENT == "boolean" || "Please set MARK_TESTS_SENT to true or false",
    typeof config.HEADER_ROWS == "number"      || "Please set HEADER_ROWS to a number",
    validString(config.SPREADSHEET_ID)         || "Please set SPREADSHEET_ID",
    validString(config.SHEET_NAME)             || "Please set SHEET_NAME",
    validString(config.TEST_SHEET_NAME)        || "Please set TEST_SHEET_NAME",
    validString(config.EMAIL_FROM)             || "Please set EMAIL_FROM",
    validString(config.EMAIL_FROM_NAME)        || "Please set EMAIL_FROM_NAME",
    validString(config.EMAIL_SUBJECT)          || "Please set EMAIL_SUBJECT",
    validIndex(config.columns)                 || "A least one column is not set to a number, check columns",
  ];
  if (! tests.every(result => typeof result == "boolean")) {
    throw new Error("config errors: " + tests.filter(result => typeof result == "string").join(". "));
  }
  // template doc ID is in properties if it was generated
  if (! validString(config.TEMPLATE_ID)) {
    config.TEMPLATE_ID = PropertiesService.getUserProperties().getProperty("TEMPLATE_ID");
    if (! config.TEMPLATE_ID) throw new Error("config error: TEMPLATE_ID not set.");
  }
  // auto generate array indicies based on column indicies; auto generate 2 rows for testing
  config.index = {};
  for (let key in config.columns) {
    config.index[key] = config.columns[key] - 1; // translate to 0 indexing for arrays
  }
}