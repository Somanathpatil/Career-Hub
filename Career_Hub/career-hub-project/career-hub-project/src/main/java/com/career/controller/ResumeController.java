package com.career.controller;


import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.career.dto.ResumeAnalysisResponse;
import com.career.dto.ResumeSkillMatchResponse;
import com.career.dto.SaveResumeSkillsRequest;
import com.career.service.ResumeAnalysisService;
import com.career.service.ResumeSKillSaveService;
import com.career.service.ResumeService;
import com.career.service.ResumeSkillService;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/resume")
public class ResumeController {
	
	@Autowired
	ResumeService rservice;
	
	@Autowired
	ResumeAnalysisService raservice;
	
	@Autowired
	ResumeSkillService rsservice;
	
	@Autowired
	ResumeSKillSaveService rssService;

	@PostMapping(
		    value = "/analyze",
		    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
		)
		public ResumeAnalysisResponse analyzeResume(
		        @RequestParam("file") MultipartFile file) throws IOException {

		    System.out.println("1. Resume upload received");

		    System.out.println("2. File size: " + file.getSize());

		    String extractedText = rservice.extractText(file);

		    System.out.println("3. PDF text extracted");
		    System.out.println("4. Extracted text length: " + extractedText.length());

		    ResumeAnalysisResponse result =
		            raservice.analysisRespomse(extractedText);

		    System.out.println("5. Gemini analysis completed");

		    return result;
		}
	
	@PostMapping("/match-skills")
	public ResumeSkillMatchResponse matchSkills(@RequestBody List<String> skills) {

	    return rsservice.matchSkills(skills);
	}
	
	@PostMapping("/save-skills")
	public Map<String, String> saveSkills(@RequestBody SaveResumeSkillsRequest request) {

	    String message = rssService.saveApprovedSkills(request);

	    return Map.of("message", message);
	}
	
	
}
