class Job {
  job = [];

  addJob(jobId, deviceId) {
    this.job.push({ jobId, deviceId });
  }

  removeJob(jobId) {
    this.job = this.job.filter(i => i.jobId !== jobId);
  }

  removeDeviceId(deviceId) {
    this.job = this.job.filter(i => i.deviceId !== deviceId);
  }

  getJobId(deviceId) {
    return this.job.find(i => i.deviceId === deviceId);
  }

}

const JobManager = new Job();

module.exports = JobManager;
