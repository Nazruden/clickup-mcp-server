import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const getTaskCommentsTool: Tool = {
  name: "clickup_get_task_comments",
  description: "Retrieve all comments for a specific ClickUp task.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "The unique identifier of the ClickUp task.",
      },
    },
    required: ["task_id"],
  },
};

export const createTaskCommentTool: Tool = {
  name: "clickup_create_task_comment",
  description: "Add a new comment to a ClickUp task.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "The unique identifier of the ClickUp task.",
      },
      comment_text: {
        type: "string",
        description: "The text content of the comment.",
      },
      assignee: {
        type: "string",
        description: "Optional ClickUp user ID to assign the comment to.",
      },
      notify_all: {
        type: "boolean",
        description:
          "If true, notify all task members about the comment. Defaults to false.",
      },
    },
    required: ["task_id", "comment_text"],
  },
};

export const updateCommentTool: Tool = {
  name: "clickup_update_comment",
  description:
    "Update an existing ClickUp comment (text, assignee, or resolved state).",
  inputSchema: {
    type: "object",
    properties: {
      comment_id: {
        type: "string",
        description: "The unique identifier of the comment to update.",
      },
      comment_text: {
        type: "string",
        description: "New text content for the comment.",
      },
      assignee: {
        type: "string",
        description: "ClickUp user ID to (re)assign the comment to.",
      },
      resolved: {
        type: "boolean",
        description: "Mark the comment as resolved (true) or unresolved (false).",
      },
    },
    required: ["comment_id"],
  },
};

export const deleteCommentTool: Tool = {
  name: "clickup_delete_comment",
  description: "Delete a ClickUp comment.",
  inputSchema: {
    type: "object",
    properties: {
      comment_id: {
        type: "string",
        description: "The unique identifier of the comment to delete.",
      },
    },
    required: ["comment_id"],
  },
};

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function textResult(payload: unknown, structuredKey: string) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: { [structuredKey]: payload },
  };
}

export async function handleGetTaskComments(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const taskId = args.task_id as string;
  if (!taskId || typeof taskId !== "string") {
    throw new Error("task_id is required and must be a string.");
  }
  logger.info(`Handling tool call: ${getTaskCommentsTool.name} for task ${taskId}`);
  const comments = await clickUpService.commentService.getTaskComments(taskId);
  return textResult(comments, "comments");
}

export async function handleCreateTaskComment(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const taskId = args.task_id as string;
  const commentText = args.comment_text as string;
  if (!taskId || typeof taskId !== "string") {
    throw new Error("task_id is required and must be a string.");
  }
  if (!commentText || typeof commentText !== "string") {
    throw new Error("comment_text is required and must be a string.");
  }
  const payload: any = { comment_text: commentText };
  if (args.assignee !== undefined) payload.assignee = args.assignee;
  if (args.notify_all !== undefined) payload.notify_all = args.notify_all;

  logger.info(
    `Handling tool call: ${createTaskCommentTool.name} for task ${taskId}`,
  );
  const result = await clickUpService.commentService.createTaskComment(
    taskId,
    payload,
  );
  return textResult(result, "comment");
}

export async function handleUpdateComment(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const commentId = args.comment_id as string;
  if (!commentId || typeof commentId !== "string") {
    throw new Error("comment_id is required and must be a string.");
  }
  const payload: any = {};
  if (args.comment_text !== undefined) payload.comment_text = args.comment_text;
  if (args.assignee !== undefined) payload.assignee = args.assignee;
  if (args.resolved !== undefined) payload.resolved = args.resolved;
  if (Object.keys(payload).length === 0) {
    throw new Error("No fields provided to update the comment.");
  }

  logger.info(`Handling tool call: ${updateCommentTool.name} for comment ${commentId}`);
  const result = await clickUpService.commentService.updateComment(
    commentId,
    payload,
  );
  return textResult(result, "comment");
}

export async function handleDeleteComment(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const commentId = args.comment_id as string;
  if (!commentId || typeof commentId !== "string") {
    throw new Error("comment_id is required and must be a string.");
  }
  logger.info(`Handling tool call: ${deleteCommentTool.name} for comment ${commentId}`);
  const result = await clickUpService.commentService.deleteComment(commentId);
  return textResult(result, "result");
}
