package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.entity.Jobs;
import com.career.repo.JobsRepo;

@Service
public class JobsService {

	@Autowired
	private JobsRepo jrepo;

	@Autowired
	private JobFetcherService jobFetcherService;

	public Jobs saveJob(Jobs jobs) {
		return jrepo.save(jobs);
	}

	public List<Jobs> getAllJobs() {
		return jrepo.findAll();
	}

	public Jobs getJobById(Integer id) {
		return jrepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found: " + id));
	}

	public List<Jobs> syncJobsForUser(Integer userId) {
		return jobFetcherService.fetchAndSaveJobsForUser(userId);
	}

	public List<Jobs> syncDailyJobs() {
		jobFetcherService.syncAllDailyJobs();
		return getAllJobs();
	}
}
