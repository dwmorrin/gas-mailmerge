/**
 * Edit config.gs to setup your app, then run this function.
 */ 
function doMailMerge() {
  validateConfiguration_();
  const spreadSheet = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  const sheetName = config.TESTING ? config.TEST_SHEET_NAME : config.SHEET_NAME;
  let sheet = spreadSheet.getSheetByName(sheetName);
  if (! sheet) {
    if (config.TESTING && config.AUTO_TEST) {
      sheet = createTestSheet_(spreadSheet);
    } else {
      throw new Error("config error: " + sheetName + " does not match a sheet in your spreadsheet.");
    }
  }
  sendMail_(sheet);
}

/**
 * Generates a Doc to use for your email template, with some example text.
 * Run, then 'View -> Logs' to retrieve the URL of the new Doc.
 * Leave the ID as '' in config.gs to use this generated Doc as your template.
 */
function generateTemplateDoc() {
  const doc = createNewTemplate_();
  PropertiesService.getUserProperties()
    .setProperty("TEMPLATE_ID", doc.getId())
  Logger.log(doc.getUrl());
}