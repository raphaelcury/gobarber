import Bee from 'bee-queue';

import CancellationMailJob from '../app/jobs/CancellationMailJob';
import redisConfig from '../config/redis';

const jobs = [CancellationMailJob];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        queue: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queueKey, jobData) {
    return this.queues[queueKey].queue.createJob(jobData).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { queue, handle } = this.queues[job.key];
      queue.process(handle);
    });
  }
}

export default new Queue();
