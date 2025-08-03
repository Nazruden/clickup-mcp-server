import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  GetCustomFieldsParams,
  ClickUpCustomField,
  SetTaskCustomFieldValueParams,
  RemoveTaskCustomFieldValueParams,
} from "../types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// Tool Definitions
export const getCustomFieldsTool: Tool = {
  name: "clickup_get_custom_fields",
  description: "Retrieves all accessible Custom Fields for a given List.",
  inputSchema: {
    type: "object",
    properties: {
      list_id: {
        type: "string",
        description: "The ID of the List to get Custom Fields from.",
      },
    },
    required: ["list_id"],
  },
};

export const setTaskCustomFieldValueTool: Tool = {
  name: "clickup_set_task_custom_field_value",
  description: "Sets the value of a Custom Field on a specific task.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "The ID of the task to update.",
      },
      field_id: {
        type: "string",
        description: "The ID of the Custom Field to set.",
      },
      value: {
        type: "string",
        description:
          'The value to set for the Custom Field, provided as a string. Convert numbers, booleans, and array elements to their string representations. For arrays (e.g., for label fields), provide a JSON string array like \'["label1", "label2"]\'. For date fields, if \'value_options.time\' is true, provide a Unix timestamp in milliseconds as a string (e.g., "1672531200000"). If \'value_options.time\' is false or not provided for a date field, provide a date string like "YYYY-MM-DD". Consult the custom field\'s type to format the string appropriately.',
      },
      value_options: {
        type: "object",
        description:
          'Optional: Additional options for setting the value. For date custom fields, use { "time": true } to set a timestamp including time, or { "time": false } for a date-only value. Other custom field types might not use these options.',
        properties: {
          time: {
            type: "boolean",
            description:
              "For date custom fields: true to include time in the date value, false for date-only.",
          },
        },
        additionalProperties: false,
      },
    },
    required: ["task_id", "field_id", "value"],
  },
};

export const removeTaskCustomFieldValueTool: Tool = {
  name: "clickup_remove_task_custom_field_value",
  description: "Removes the value of a Custom Field from a specific task.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "The ID of the task to update.",
      },
      field_id: {
        type: "string",
        description: "The ID of the Custom Field to clear.",
      },
    },
    required: ["task_id", "field_id"],
  },
};

// Handler Functions
export async function handleGetCustomFields(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetCustomFieldsParams;
  if (!params.list_id || typeof params.list_id !== "string") {
    throw new Error("List ID is required.");
  }
  logger.info(
    `Handling tool call: ${getCustomFieldsTool.name} for list_id: ${params.list_id}`,
  );
  const customFields: ClickUpCustomField[] =
    await clickUpService.customFieldService.getCustomFields(params.list_id);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(customFields, null, 2),
      },
    ],
  };
}

export async function handleSetTaskCustomFieldValue(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as SetTaskCustomFieldValueParams;
  if (!params.task_id || typeof params.task_id !== "string") {
    throw new Error("Task ID is required.");
  }
  if (!params.field_id || typeof params.field_id !== "string") {
    throw new Error("Field ID is required.");
  }
  if (params.value === undefined) {
    // Explicitly check for undefined as null/false/0 might be valid values
    throw new Error("Value is required to set a custom field.");
  }
  logger.info(
    `Handling tool call: ${setTaskCustomFieldValueTool.name} for task_id: ${params.task_id}, field_id: ${params.field_id}`,
  );
  await clickUpService.customFieldService.setTaskCustomFieldValue(params);
  return {
    content: [
      {
        type: "text",
        text: `Successfully set custom field ${params.field_id} for task ${params.task_id}.`,
      },
    ],
  };
}

export async function handleRemoveTaskCustomFieldValue(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as RemoveTaskCustomFieldValueParams;
  if (!params.task_id || typeof params.task_id !== "string") {
    throw new Error("Task ID is required.");
  }
  if (!params.field_id || typeof params.field_id !== "string") {
    throw new Error("Field ID is required.");
  }
  logger.info(
    `Handling tool call: ${removeTaskCustomFieldValueTool.name} for task_id: ${params.task_id}, field_id: ${params.field_id}`,
  );
  await clickUpService.customFieldService.removeTaskCustomFieldValue(params);
  return {
    content: [
      {
        type: "text",
        text: `Successfully removed custom field ${params.field_id} for task ${params.task_id}.`,
      },
    ],
  };
}
