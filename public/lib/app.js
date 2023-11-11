import { Grid, html } from 'https://unpkg.com/gridjs?module';
import { FLAGS } from './settings.js';
import { Report } from './models.js';

export default class Application {
  static State = {
    // preserve table's sorting state
    Sort: {
      Id: null,
      Type: 1,
      Timer: null,
    },
  };
  static Data = [];
  static Scale = 1;
  static Grid = null;
  // stores where was the screen last time
  static ScreenY = 0;
  // renders table
  static UpdateTable() {
    Application.State.Sort.Timer && clearTimeout(Application.State.Sort.Timer);
    Application.ClearTable();
    // convert seconds into string format 'hh:mm:ss'
    const secondsToTimeFormat = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.ceil(seconds % 60);
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };
    const formatter = (operationType) => {
      return (operationTime, row) => {
        const toolName = row.cells[0].data;
        const tool = Application.Data.GetToolByName(toolName);

        if (operationTime[0] === '#') operationTime = operationTime.slice(1);
        // bringing scale factor into the calculation
        operationTime *= Application.Scale;

        let formatted = `<span style='color: #${
          operationTime ? '000' : 'bbb'
        }'>${secondsToTimeFormat(operationTime)}</span>`;

        if (operationType && toolName !== '#Total') {
          formatted += `<div style='color: #${
            tool.LifeSpan[operationType] ? '43A047' : '43A04766'
          }'>${secondsToTimeFormat(tool.LifeSpan[operationType] * 60)}</div>`;
        }

        return html(formatted);
      };
    };
    // this overwrite default sort function to prevent from sum row (last augmented row) to change position
    const sort = {
      compare: (a, b) => {
        // last augmented row values start with # so we know it last sum row and avoid sorting to affect it
        if (a[0] === '#' || b[0] === '#') {
          return 0;
        }
        if (a === 'N/D') return -1;
        if (
          Number(a.toString().replace(/,/g, '')) >
          Number(b.toString().replace(/,/g, ''))
        ) {
          return -1;
        } else {
          return 1;
        }
      },
    };
    Application.Grid = new Grid({
      sort: true,
      resizable: true,
      columns: [
        {
          name: 'Tool Name',
          formatter: (name) => {
            let formatted = name.replace('#', '');
            if (formatted !== 'Total') {
              formatted += `<div style='color: #B71C1C;font-size: 12px;'>Price: ${
                Application.Data.GetToolByName(name).Price
              }</div>`;
            }
            return html(formatted);
          },
          sort,
        },
        {
          name: 'Diameter',
          formatter: (diameter) => {
            return diameter === '#Diameter'
              ? 'Diameter'
              : html(`${diameter}<b style='font-size: 9px'>mm</b>`);
          },
          sort,
        },
        {
          name: 'Operation Time',
          columns: [
            ...Object.keys(FLAGS).map((operationType) => {
              return {
                name: operationType,
                formatter: formatter(operationType),
                sort,
              };
            }),
            {
              name: 'Total',
              formatter: formatter(),
              sort,
            },
          ],
        },
        {
          name: 'Supply',
          formatter: (value) => {
            return value.replace('#', '');
          },
          sort,
        },
        {
          name: 'Parts',
          formatter: (value) => {
            return value.replace('#', '');
          },
          sort,
        },
        {
          name: 'Cost',
          formatter: (value) => {
            return value.replace('#', '');
          },
          sort,
        },
      ],
      data: () => {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve(
                Application.Data.ToolsList.map((tool) => {
                  window.scroll(0, Application.ScreenY);
                  return [
                    tool.Name,
                    tool.Diameter,
                    ...Object.values(tool.OperationTime),
                    tool.Supply === '#Supply'
                      ? tool.Supply
                      : tool.Supply
                      ? (tool.Supply * Application.Scale).toFixed(4)
                      : 'N/D', // supply
                    tool.Supply === '#Supply'
                      ? 'Parts'
                      : tool.Supply
                      ? ((1 / tool.Supply) * Application.Scale).toFixed(2)
                      : 'N/D', // supply
                    tool.Supply
                      ? (tool.Name === '#Total' ? '#' : '') +
                        Math.floor(
                          (tool.Supply === '#Supply' ? 1 : tool.Supply) *
                            Application.Scale *
                            (tool.Price + '').replace(/,/g, '')
                        )
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      : 'N/D', // cost
                  ];
                })
              ),
            1000
          );
        });
      },
    });
    Application.Grid.render(document.getElementById('table'));
    Application.Grid.on('rowClick', (cell, row) => {
      Application.ShowToolDataDialog(row.cells[0].data);
    });

    Application.State.Sort.Timer = setTimeout(() => {
      if (Application.State.Sort.Id) {
        const clickEvent = new Event('click');
        for (let i = 0; i <= Application.State.Sort.Type; i++) {
          document
            .querySelector(`[data-column-id="${Application.State.Sort.Id}"]`)
            .dispatchEvent(clickEvent);
        }
      }
      document.querySelectorAll('th').forEach((column) => {
        column.addEventListener('click', function () {
          const dataColumnId = this.getAttribute('data-column-id');
          if (dataColumnId === 'operationTime') return;
          if (Application.State.Sort.Id === dataColumnId) {
            Application.State.Sort.Type++;
            Application.State.Sort.Type %= 2;
          } else {
            Application.State.Sort.Type = 0;
            Application.State.Sort.Id = dataColumnId;
          }
        });
      });
    }, 1001);

    Application.Data.ToolsList.at(-1).Price = 0;
    Application.Data.ToolsList.forEach((tool, i) => {
      if (i === Application.Data.ToolsList.length - 1) return;
      Application.Data.ToolsList.at(-1).Price +=
        tool.Price.toString().replace(/,/g, '') * tool.Supply;
    });
  }
  static ShowToolDataDialog(toolName) {
    if (toolName === '#Total') return;
    document.querySelector('dialog').style.display = 'flex';
    document.querySelector('.glass').style.display = 'block';
    document.querySelector('#tool-name-placeholder').innerText = toolName;
    document.querySelector('.container').style.filter = 'blur(6px)';
    const form = document.querySelector('#form-life-span');
    const formData = new FormData(form);
    const tool =
      Application.Data.ToolsList[Application.Data.GetToolIndexByName(toolName)];
    const restoredTool = Application.RestoreTool(toolName);
    for (const operationType of formData.keys()) {
      const input = form.elements[operationType];
      input.value =
        tool.LifeSpan[operationType] ||
        (restoredTool ? restoredTool.LifeSpan[operationType] : 0);
    }
    document.querySelector('#tool-price').value =
      tool.Price || (restoredTool ? restoredTool.Price : 0);
  }
  static HideToolDataDialog() {
    document.querySelector('dialog').style.display = 'none';
    document.querySelector('.glass').style.display = 'none';
    document.querySelector('.container').style.filter = '';
  }
  static SaveToolData() {
    const formData = new FormData(document.querySelector('#form-life-span'));
    const toolName = document.querySelector('#tool-name-placeholder').innerText;
    const tool =
      Application.Data.ToolsList[Application.Data.GetToolIndexByName(toolName)];
    Application.Data.ToolsList.at(-1).Price -=
      tool.Price.toString().replace(/,/g, '') * tool.Supply;
    tool.Supply = 0;
    let noErrorInCalculatingSupply = true;
    for (const operationType of formData.keys()) {
      const newLifeSpan = Number(formData.get(operationType));
      tool.LifeSpan[operationType] = Number(formData.get(operationType));
      if (tool.OperationTime[operationType] && newLifeSpan) {
        tool.Supply += tool.OperationTime[operationType] / (newLifeSpan * 60);
      } else if (tool.OperationTime[operationType] && !newLifeSpan) {
        noErrorInCalculatingSupply = false;
      }
    }
    tool.Supply = tool.Supply.toFixed(4);
    if (!noErrorInCalculatingSupply) tool.Supply = false;
    tool.Price = document.querySelector('#tool-price').value;
    Application.Data.ToolsList.at(-1).Price +=
      tool.Price.toString().replace(/,/g, '') * tool.Supply;
    Application.HideToolDataDialog();
    Application.UpdateTable();
    Application.SaveTable();
    Application.SaveTool(tool);
  }
  // destroys table
  static ClearTable() {
    if (Application.Grid) {
      Application.Grid.destroy();
    }
  }
  // takes a array of reports as input and take care of everything
  static LoadFromReports(reports) {
    const mergedReports = Report.Merge(reports);
    Application.Data = Report.Augmented(mergedReports);
    Application.UpdateTable();
  }
  // save table data to localStorage
  static SaveTable() {
    localStorage.TableData = JSON.stringify(Application.Data);
  }
  // restore table data from localStorage
  static RestoreTable() {
    if (!localStorage.TableData) return;
    const report = new Report();
    const parsedData = JSON.parse(localStorage.TableData);
    report.ToolsList = parsedData.ToolsList;
    report.OperationCount = parsedData.OperationCount;
    Application.Data = report;
    Application.UpdateTable();
  }
  // save tool data to localStorage
  static SaveTool(tool) {
    localStorage[`TD-${tool.Name}`] = JSON.stringify(tool);
  }
  // load tool data from localStorage
  static RestoreTool(toolName) {
    if (!localStorage[`TD-${toolName}`]) return undefined;
    return JSON.parse(localStorage[`TD-${toolName}`]);
  }
  // export the localStorage data as a JSON file and allow the user to download it
  static ExportDataAsJSON() {
    const data = localStorage;

    if (data) {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();

      URL.revokeObjectURL(url);
    }
  }
  // correct the supply value for each tool
  static ReformSupply() {
    Application.Data.ToolsList.forEach((tool) => {
      // get
      const toolName = tool.Name;
      const data = {};
      if (toolName === '#Total') return;
      const form = document.querySelector('#form-life-span');
      const formData = new FormData(form);
      tool =
        Application.Data.ToolsList[
          Application.Data.GetToolIndexByName(toolName)
        ];
      const restoredTool = Application.RestoreTool(toolName);
      for (const operationType of formData.keys()) {
        data[operationType] =
          tool.LifeSpan[operationType] ||
          (restoredTool ? restoredTool.LifeSpan[operationType] : 0);
      }
      let price = tool.Price || (restoredTool ? restoredTool.Price : 0);
      // set
      Application.Data.ToolsList.at(-1).Price -=
        tool.Price.toString().replace(/,/g, '') * tool.Supply;
      tool.Supply = 0;
      let noErrorInCalculatingSupply = true;
      for (const operationType of formData.keys()) {
        const newLifeSpan = Number(data[operationType]);
        tool.LifeSpan[operationType] = Number(data[operationType]);
        if (tool.OperationTime[operationType] && newLifeSpan) {
          tool.Supply += tool.OperationTime[operationType] / (newLifeSpan * 60);
        } else if (tool.OperationTime[operationType] && !newLifeSpan) {
          noErrorInCalculatingSupply = false;
        }
      }
      tool.Supply = tool.Supply.toFixed(4);
      if (!noErrorInCalculatingSupply) tool.Supply = false;
      tool.Price = price;
      Application.Data.ToolsList.at(-1).Price +=
        tool.Price.toString().replace(/,/g, '') * tool.Supply;
      Application.SaveTool(tool);
    });
    Application.UpdateTable();
    Application.SaveTable();
  }
}

window.Application = Application;
