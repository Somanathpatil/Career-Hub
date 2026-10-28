package com.career.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.career.entity.Course;
import com.career.service.CourseFetcherService;
import com.career.service.CourseService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/course")
public class CourseController {

	@Autowired
	private CourseService cservice;

	@Autowired
	private CourseFetcherService courseFetcherService;

	@PostMapping("/add")
	public Course addCourse(@RequestBody Course course) {
		return cservice.saveCourse(course);
	}

	@GetMapping
	public List<Course> viewAllCourse() {
		return cservice.getAllCourse();
	}

	@GetMapping("/{cid}")
	public Course viewById(@PathVariable Integer cid) {
		return cservice.getById(cid);
	}

	/**
	 * Trigger 10-day upskilling course fetch via Gemini AI.
	 * Pass ?force=true to override the 10-day interval restriction.
	 */
	@PostMapping("/sync")
	public ResponseEntity<Map<String, Object>> syncCourses(
			@RequestParam(required = false, defaultValue = "false") boolean force) {
		Map<String, Object> result = courseFetcherService.syncUpskillingCourses(force);
		return ResponseEntity.ok(result);
	}

	/**
	 * Retrieve current 10-day cycle sync status.
	 */
	@GetMapping("/sync-status")
	public ResponseEntity<Map<String, Object>> getSyncStatus() {
		return ResponseEntity.ok(courseFetcherService.getSyncStatus());
	}
}
