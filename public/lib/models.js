import { SELECTORS, FLAGS } from './settings.js';

export class Report {
  // stores the total number of operation in the given datasheet
  OperationCount = 0;
  // determine if that given input template was valid
  Healthy = true;
  // stores list of tools in the inputs templates
  ToolsList = [];
  constructor(template) {
    this.Template = template;
    if (template) {
      this.ExtractToolNames();
      this.ExtractOperationTime();
    }
  }
  // scrap the input template and search for tool names, the output is stored in `ToolsList`
  ExtractToolNames() {
    const idContainerTags = this.Template.querySelectorAll(
      SELECTORS['TOOL-ID']
    );
    const nameContainerTags = this.Template.querySelectorAll(
      SELECTORS['TOOL-NAME']
    );
    const diameterContainerTags = this.Template.querySelectorAll(
      SELECTORS['TOOL-DIAMETER']
    );
    for (let i = 0; i < idContainerTags.length; i++) {
      this.ToolsList.push(
        new Tool(
          idContainerTags[i].innerText,
          nameContainerTags[i].innerText,
          Number(diameterContainerTags[i].innerText)
        )
      );
    }
  }
  // for each tool in `ToolsList` gather operation time
  ExtractOperationTime() {
    const typeContainerTags = this.Template.querySelectorAll(
      SELECTORS['OPERATION-TYPE']
    );
    const timeContainerTags = this.Template.querySelectorAll(
      SELECTORS['OPERATION-TIME']
    );
    const idContainerTags = this.Template.querySelectorAll(
      SELECTORS['OPERATION-TOOL-ID']
    );
    if (
      !(
        typeContainerTags.length !== 0 &&
        typeContainerTags.length === timeContainerTags.length &&
        timeContainerTags.length === idContainerTags.length
      )
    ) {
      this.Healthy = false;
      return;
    }
    this.OperationCount = typeContainerTags.length;
    for (let i = 0; i < timeContainerTags.length; i++) {
      const timeString = timeContainerTags[i].innerText;
      // first letter indicates type of operation
      const operationType = typeContainerTags[i].innerText;
      const id = idContainerTags[i].innerText;
      // convert time from string format to seconds
      const timeParts = timeString.split(':');
      const hours = Number(timeParts[0], 10);
      const minutes = Number(timeParts[1], 10);
      const seconds = Number(timeParts[2], 10);
      const timeInSeconds = hours * 3600 + minutes * 60 + seconds;

      const toolIndex = this.GetToolIndexById(id);

      // update usage time for tool
      for (const type of Object.keys(FLAGS)) {
        if (
          FLAGS[type].some((flag) => {
            return operationType.toLowerCase().startsWith(flag.toLowerCase());
          })
        ) {
          this.ToolsList[toolIndex].OperationTime[type] += timeInSeconds;
        }
      }
      this.ToolsList[toolIndex].OperationTime['Total'] += timeInSeconds;
      this.ToolsList[toolIndex].ParticipationCount++;
    }
  }
  // return tool index given tool id
  GetToolIndexById(id) {
    return this.ToolsList.findIndex((tool) => {
      return tool.ID === id;
    });
  }
  // return tool index given tool name
  GetToolIndexByName(name) {
    return this.ToolsList.findIndex((tool) => {
      return tool.Name === name;
    });
  }
  // return tool given tool name
  GetToolByName(name) {
    return this.ToolsList[this.GetToolIndexByName(name)];
  }
  // merge multiple reports into one
  static Merge(reports) {
    const mergedReport = new Report();
    for (const report of reports) {
      for (const tool of report.ToolsList) {
        const existingToolIndex = mergedReport.GetToolIndexByName(tool.Name);
        if (existingToolIndex !== -1) {
          // Tool with the same name already exists in the merged report
          const existingTool = mergedReport.ToolsList[existingToolIndex];
          // Add operation times of the same type together
          for (const [operationType, operationTime] of Object.entries(
            tool.OperationTime
          )) {
            existingTool.OperationTime[operationType] += operationTime;
          }
          existingTool.ParticipationCount += tool.ParticipationCount;
        } else {
          // New tool, add it to the merged report
          mergedReport.ToolsList.push(
            new Tool(tool.ID, tool.Name, tool.Diameter)
          );
          // Copy operation times
          for (const [operationType, operationTime] of Object.entries(
            tool.OperationTime
          )) {
            mergedReport.ToolsList[
              mergedReport.ToolsList.length - 1
            ].OperationTime[operationType] = operationTime;
          }
          mergedReport.ToolsList.at(-1).ParticipationCount +=
            tool.ParticipationCount;
        }
      }
      mergedReport.OperationCount += report.OperationCount;
    }
    return mergedReport;
  }
  // return the report with added row that represents the sum of other rows
  static Augmented(report) {
    // # is added to this row be determined as last sum row
    const sum = new Tool('#' + '<3', '#' + 'Total', '#' + 'Diameter');
    sum.Supply = '#Supply';
    for (const tool of report.ToolsList) {
      for (const operationType of Object.keys(tool.OperationTime)) {
        sum.OperationTime[operationType] += tool.OperationTime[operationType];
      }
    }
    for (const operationType of Object.keys(sum.OperationTime)) {
      sum.OperationTime[operationType] = '#' + sum.OperationTime[operationType];
    }
    report.ToolsList.push(sum);
    return report;
  }
}

export class Tool {
  // how many operation this tool is used in
  ParticipationCount = 0;
  // how much time its used in each operation type
  OperationTime = {};
  // its durability in each operation time (in minutes)
  LifeSpan = {};
  // price for this tool
  Price = 0;
  // how many of this tool is needed based on usage time (datasheet) and life-span
  Supply = false;
  constructor(id, name, diameter) {
    this.ID = id;
    this.Name = name;
    this.Diameter = diameter;
    const restoredTool = Application.RestoreTool(name);
    this.Price = restoredTool ? restoredTool.Price : 0;
    for (const operationType of Object.keys(FLAGS)) {
      this.OperationTime[operationType] = 0;
      this.LifeSpan[operationType] = restoredTool
        ? restoredTool.LifeSpan[operationType]
        : 0;
    }
    this.OperationTime['Total'] = 0;
  }
}
