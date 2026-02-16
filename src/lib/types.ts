export interface Task {
  id: string;
  name: string;
  groupId: string;
  groupTitle: string;
  priority?: 'High' | 'Medium' | 'Low';
  project?: string;
  deadline?: string;
  status?: string;
  description?: string;
}

export interface Group {
  id: string;
  title: string;
  color: string;
  emoji: string;
  taskCount: number;
}

export function parseTask(mondayTask: any): Task {
  const task: Task = {
    id: mondayTask.id,
    name: mondayTask.name,
    groupId: mondayTask.group.id,
    groupTitle: mondayTask.group.title,
  };

  mondayTask.column_values?.forEach((col: any) => {
    try {
      if (col.id === 'color_mm0mx10q' && col.text) {
        // Priority: High=0, Medium=1, Low=2
        task.priority = col.text as 'High' | 'Medium' | 'Low';
      } else if (col.id === 'color_mm0mv81k' && col.text) {
        // Project
        task.project = col.text;
      } else if (col.id === 'date4' && col.text) {
        // Deadline
        task.deadline = col.text;
      } else if (col.id === 'status' && col.text) {
        // Status
        task.status = col.text;
      } else if (col.id === 'text_mkqzaznf' && col.text) {
        // Description
        task.description = col.text;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });

  return task;
}

export function groupIdToEmoji(groupId: string): string {
  if (groupId === 'topics') return '📋';
  if (groupId === 'group_mm0m8a0') return '🔥';
  return '📁';
}
