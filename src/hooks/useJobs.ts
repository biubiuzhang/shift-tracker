import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Job } from '../db';

export function useJobs(includeArchived = false) {
  const allJobs = useLiveQuery(() => db.jobs.toArray()) ?? [];

  const jobs = includeArchived ? allJobs : allJobs.filter((j) => !j.archived);

  async function addJob(job: Omit<Job, 'id'>) {
    return db.jobs.add(job);
  }

  async function updateJob(id: number, changes: Partial<Job>) {
    return db.jobs.update(id, changes);
  }

  async function toggleArchive(id: number) {
    const job = await db.jobs.get(id);
    if (job) {
      return db.jobs.update(id, { archived: !job.archived });
    }
  }

  return { jobs, allJobs, addJob, updateJob, toggleArchive };
}
