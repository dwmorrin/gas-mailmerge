function doGet() {
  const template = HtmlService.createTemplateFromFile("client/index");
  const aliases = [Session.getActiveUser().getEmail(), ...GmailApp.getAliases()];
  aliases.sort();
  template.aliases = aliases;
  
  const properties = PropertiesService.getUserProperties();
  const emailTemplate = getStoredEmailTemplate(properties);
  template.emailTemplate = emailTemplate ?
    {url: emailTemplate.getUrl(), name: emailTemplate.getName(), id: emailTemplate.getId()} :
    null;
  template.spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  template.sheetName = properties.getProperty("SHEET_NAME");
  const webpage = template.evaluate();
  webpage.setTitle("Mail Merge").addMetaTag("viewport", "width=device-width");
  return webpage;
}

/**
 * Attempts to return the stored template Doc.
 * Null if there is no stored ID, or the stored ID points to a deleted Doc.
 * @returns {string|null}
 */
function getStoredEmailTemplate(properties) {
  const templateId = properties.getProperty("TEMPLATE_ID");
  if (! templateId) {
    return null;
  }
  try {
    return DocumentApp.openById(templateId);  
  } catch (error) {
    if (/missing|delete/.test(error.message)) {
      properties.deleteProperty("TEMPLATE_ID");
      return null;
    }
    throw error;
  }
}

function createNewTemplate() {
  const doc = createNewTemplate_();
  PropertiesService.getUserProperties()
    .setProperty("TEMPLATE_ID", doc.getId());
  return {url: doc.getUrl(), name: doc.getName()};
}

/**
 * Utility function to keep separate HTML, CSS, and JS files
 * @see {@link https://developers.google.com/apps-script/guides/html/best-practices}
 */
function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetNames(id) {
  // we need to register this spreadsheet as the chosen spreadsheet
  PropertiesService.getUserProperties().setProperty("SPREADSHEET_ID", id);
  const sheetNames = SpreadsheetApp.openById(id).getSheets()
    .map(sheet => { return sheet.getName(); });
  sheetNames.sort();
  return sheetNames;
}

function getHeaders(sheetName) {
  const id = PropertiesService.getUserProperties().getProperty("SPREADSHEET_ID");
  const sheet = SpreadsheetApp.openById(id).getSheetByName(sheetName);
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script. In this case, the function includes an unused call
 * to a DriveApp method to ensure that Apps Script requests access to all files
 * in the user's Drive.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken(view) {
  //DriveApp.getRootFolder();
  return {token: ScriptApp.getOAuthToken(), view};
}
function test() {
          console.log(PropertiesService.getUserProperties().getProperties());
}