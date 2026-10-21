import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TaskItem } from '../models/task.models';
import { formatTaskLabel } from '../utils/legacy-format';

const PRIORITY_ORDER: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

@Injectable({ providedIn: 'root' })
export class TasksService {
  async getTasksByOwner(owner: string, token: string): Promise<TaskItem[]> {
    const encodedOwner = encodeURIComponent(owner);
    const response = await fetch(`${environment.tasksBaseUrl}${environment.tasksPath}?owner=${encodedOwner}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('No se pudo cargar el dashboard.');
    }

    return (await response.json()) as TaskItem[];
  }

  toVisibleTasks(tasks: TaskItem[]): TaskItem[] {
    return tasks
      .filter((task) => task.status !== 'ARCHIVED')
      .map((task) => ({
        ...task,
        label: formatTaskLabel(task)
      }))
      .sort((left, right) => this.getPriorityValue(right.priority) - this.getPriorityValue(left.priority));
  }

  private getPriorityValue(priority: string): number {
    return PRIORITY_ORDER[(priority || '').toUpperCase()] || 0;
  }
}
