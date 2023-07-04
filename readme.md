# SolidCAM Setupsheet Analyzer (SSA)

This web application allows you to analyze SolidCAM setup sheet files in HTML format. By uploading the datasheets, you can get a better understanding of the project, including estimations of the tool costs and the number of tools required. The application provides sorting capabilities to arrange the data based on your preferences.

## Usage

1. Serve the web application to run it locally. It is not recommended to open the `index.html` file directly in a browser.
2. Upload the SolidCAM setup sheet files in HTML format using the "Upload Datasheets" button.
3. View and analyze the data presented in the table.
4. Use the sorting options to arrange the data based on your requirements.
5. Estimate the cost of the tools used in the project and determine the quantity of specific tools required.

## Serving the Web Application

to serve the application you can use the following command: 
```bash
node server.js
```

## Additional Notes

- The web application accepts SolidCAM setup sheet files in HTML format.
- The estimation of tool costs is based on the data extracted from the setup sheet files.
- The sorting capabilities allow you to arrange the data in the table based on your preferences.
- Make sure to specify the scale factor appropriately using the input field provided.
- The web application is designed to provide insights into the tool usage and cost estimation for SolidCAM projects.

## Contributing
Pull requests are welcome. For major changes or feature requests, please open an issue first to discuss what you would like to change.