import { Report } from './src/models.js';
import Application from './src/app.js';

document.querySelector('#input-file').oninput = function() {
	const fileInput = this;
	const files = fileInput.files;

	const reports = [];
	window.reports = reports;

	for (const file of files) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const fileContent = e.target.result;
			const parser = new DOMParser();
			const template = parser.parseFromString(fileContent, 'text/html');
			const report = new Report(template);
			if (!report.Healthy) {
				alert('One or more input datasheets are not valid !');
				return;
			}
			reports.push(report);
			if (reports.length === files.length) {
        // All files have been loaded, update the table
        Application.LoadFromReports(reports);
        Application.SaveTable();
        this.value = null;
      }
    };
    reader.readAsText(file);
  }
}

document.querySelector('#clear-table').onclick = () => {
	Application.ClearTable();
	localStorage.removeItem('TableData');
}

document.querySelector('#input-scale').oninput = function() {
	Application.Scale = Number(this.value);
	Application.UpdateTable();
}

window.addEventListener("load", (event) => {
	Application.RestoreTable();
});

document.querySelector('#button-close-life-span').onclick = () => {
	Application.HideToolDataDialog();
}

document.querySelector('#button-save-life-span').onclick = () => {
	Application.SaveToolData();
}

document.body.onkeydown = (e) => {
	if (window.getComputedStyle(document.querySelector('dialog')).display !== 'none' && e.key === 'Enter') {
		Application.SaveToolData();
	}
}

const numericalStepperInputs = document.querySelectorAll('input[type="text"]');
numericalStepperInputs.forEach((input) => {
	input.addEventListener('wheel', (e) => {
		e.preventDefault();
		const currentValue = Number(input.value.replace(/,/g, ''));
		const step = Number(input.step);
		const newValue = e.deltaY < 0 ? currentValue + step * (e.ctrlKey ? 10 : 1) : currentValue - step * (e.ctrlKey ? 10 : 1);
		if (newValue >= Number(input.min))
			input.value = newValue;

		const event = new Event('input');
		input.dispatchEvent(event);
	});
});

const toolPriceInput = document.querySelector('#tool-price');
toolPriceInput.addEventListener('input', formatValue);

function formatValue(e) {
  toolPriceInput.removeEventListener('input', formatValue); // Remove the event listener temporarily

  const value = e.target.value;
  const unformattedValue = value.replace(/,/g, ''); // Remove existing commas
  const formattedValue = numberWithCommas(unformattedValue); // Format the value with commas
  e.target.value = formattedValue;

  toolPriceInput.addEventListener('input', formatValue); // Reattach the event listener
}

function numberWithCommas(value) {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Event listener attached to the parent element
document.querySelector('.glass').addEventListener('click', (event) => {
	Application.HideToolDataDialog();
});