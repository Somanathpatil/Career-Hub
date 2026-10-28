package com.career.controller;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.dto.JobMatchingResponse;
import com.career.service.JobMatchingService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/jobmatch")
public class JobMatchingController {

	@Autowired
	JobMatchingService jmservice;
	
	
	@GetMapping("/user/{uid}/job/{jid}")
	public ResponseEntity<JobMatchingResponse> matching(
	        @PathVariable Integer uid,
	        @PathVariable Integer jid) {

	    return ResponseEntity.ok(
	            jmservice.calculateMatch(uid, jid)
	    );
	}
	
}
