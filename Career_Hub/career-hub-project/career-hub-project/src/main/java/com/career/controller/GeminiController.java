package com.career.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.service.GeminiService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/ai")
public class GeminiController {

	@Autowired
	GeminiService gservice;
	
	@PostMapping("/career-guidance")
	public Map<String, String> careerGuidance(@RequestBody Map<String, String> req){
		
		String prompt = req.get("prompt");
		
		if(prompt == null || prompt.isBlank()) {
			throw new IllegalArgumentException("Prompt is Requied");
		}
		
		String guidance = gservice.generateCareerGuidance(prompt);
		
		return Map.of("guidance", guidance);
		
	}
	
	
}
