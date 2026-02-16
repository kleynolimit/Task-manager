// Monday.com GraphQL client

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN!;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID!;

export interface MondayTask {
  id: string;
  name: string;
  group: {
    id: string;
    title: string;
  };
  column_values: Array<{
    id: string;
    text?: string;
    value?: string;
  }>;
}

export interface MondayGroup {
  id: string;
  title: string;
  color: string;
  items_count?: number;
}

async function mondayQuery(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': MONDAY_API_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error('Monday.com API errors:', data.errors);
    throw new Error(data.errors[0]?.message || 'Monday.com API error');
  }

  return data.data;
}

export async function getGroups(): Promise<MondayGroup[]> {
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        groups {
          id
          title
          color
        }
      }
    }
  `;

  const data = await mondayQuery(query, { boardId: MONDAY_BOARD_ID });
  const groups = data.boards[0]?.groups || [];
  
  // Filter to only show "topics" (Pavlo) and "group_mm0m8a0" (Urgent)
  return groups.filter((g: MondayGroup) => 
    g.id === 'topics' || g.id === 'group_mm0m8a0'
  );
}

export async function getTasksInGroup(groupId: string): Promise<MondayTask[]> {
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        groups(ids: ["${groupId}"]) {
          items_page {
            items {
              id
              name
              group {
                id
                title
              }
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await mondayQuery(query, { boardId: MONDAY_BOARD_ID });
  return data.boards[0]?.groups[0]?.items_page?.items || [];
}

export async function createTask(
  name: string,
  groupId: string,
  columnValues?: Record<string, any>
): Promise<MondayTask> {
  const query = `
    mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON) {
      create_item(
        board_id: $boardId,
        group_id: $groupId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
        name
        group {
          id
          title
        }
        column_values {
          id
          text
          value
        }
      }
    }
  `;

  const data = await mondayQuery(query, {
    boardId: MONDAY_BOARD_ID,
    groupId,
    itemName: name,
    columnValues: columnValues ? JSON.stringify(columnValues) : undefined,
  });

  return data.create_item;
}

export async function moveTaskToGroup(taskId: string, groupId: string): Promise<void> {
  const query = `
    mutation ($itemId: ID!, $groupId: String!) {
      move_item_to_group(item_id: $itemId, group_id: $groupId) {
        id
      }
    }
  `;

  await mondayQuery(query, { itemId: taskId, groupId });
}

export async function updateTask(
  taskId: string,
  columnValues: Record<string, any>
): Promise<MondayTask> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(
        board_id: $boardId,
        item_id: $itemId,
        column_values: $columnValues
      ) {
        id
        name
        group {
          id
          title
        }
        column_values {
          id
          text
          value
        }
      }
    }
  `;

  const data = await mondayQuery(query, {
    boardId: MONDAY_BOARD_ID,
    itemId: taskId,
    columnValues: JSON.stringify(columnValues),
  });

  return data.change_multiple_column_values;
}

export async function deleteTask(taskId: string): Promise<void> {
  const query = `
    mutation ($itemId: ID!) {
      delete_item(item_id: $itemId) {
        id
      }
    }
  `;

  await mondayQuery(query, { itemId: taskId });
}

export async function getTask(taskId: string): Promise<MondayTask> {
  const query = `
    query ($itemIds: [ID!]) {
      items(ids: $itemIds) {
        id
        name
        group {
          id
          title
        }
        column_values {
          id
          text
          value
        }
      }
    }
  `;

  const data = await mondayQuery(query, { itemIds: [taskId] });
  return data.items[0];
}
