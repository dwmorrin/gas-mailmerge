// configure your application here:
const config = {
  // Data Spreadsheet
  SPREADSHEET_ID: '',      // In your Sheet URL: https://docs.google.com/spreadsheets/d/****THIS_IS_THE_ID_HERE****/edit
  SHEET_NAME: '',          // The name of the sheet with email data
  HEADER_ROWS: 1,          // How many header rows?  We will skip this many rows before trying to email.
  columns: {               // register your Sheet columns here using A=1, B=2, ..., any order you like
    NAME: 1,               //   Name of person you are emailing
    EMAIL: 2,              //   Email of person you are emailing
    PAYLOAD: 3,            //   The special data you need to send via email
    EMAIL_SENT: 4,         //   Confirmation after GmailApp.sendEmail runs successfully
                           //   <= you can add additional column names here
  },
  
  // Template Doc
  TEMPLATE_ID: '',         // Google Doc that contains your email template.  Leave blank if you generated a template.
  
  // Gmail
  EMAIL_FROM: '',          // Gmail account you are sending from, can be one of your aliases
  EMAIL_FROM_NAME: '',     // This is the "from" name the recipients will see
  EMAIL_SUBJECT: '',       // email subject line
  
  // Testing
  TESTING: true,           // Change to false when you're ready to run the mail merge for real
  AUTO_TEST: true,         // If true, a test sheet will be created for you using your own email.
  TEST_SHEET_NAME: 'TEST', // Name of the test sheet.
  MARK_TESTS_SENT: false,  // If true, you will have to manually reset your test sheet's EMAIL_SENT column between tests
};

