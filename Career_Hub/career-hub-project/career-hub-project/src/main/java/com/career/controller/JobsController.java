package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.entity.Jobs;
import com.career.service.JobsService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/jobs")
public class JobsController {

	@Autowired
	private JobsService jservice;
		
	@PostMapping("/add")
	public ResponseEntity<Jobs> addJobs(@RequestBody Jobs jobs) {
		Jobs saved = jservice.saveJob(jobs);
		return ResponseEntity.ok(saved);
	}
	
	@GetMapping
	public ResponseEntity<List<Jobs>> viewAllJobs() {
		return ResponseEntity.ok(jservice.getAllJobs());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Jobs> getJobById(@PathVariable Integer id) {
		return ResponseEntity.ok(jservice.getJobById(id));
	}

	@PostMapping("/sync-user/{userId}")
	public ResponseEntity<List<Jobs>> syncJobsForUser(@PathVariable Integer userId) {
		List<Jobs> synced = jservice.syncJobsForUser(userId);
		return ResponseEntity.ok(synced);
	}

	@PostMapping("/sync-daily")
	public ResponseEntity<List<Jobs>> syncDailyJobs() {
		List<Jobs> all = jservice.syncDailyJobs();
		return ResponseEntity.ok(all);
	}
}
