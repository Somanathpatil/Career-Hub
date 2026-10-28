package com.career.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.dto.ResumeAnalysisResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ResumeAnalysisService {

	@Autowired
	GeminiService gservice;
	
	@Autowired
	ObjectMapper omapper;
	
	public ResumeAnalysisResponse analysisRespomse(String resumeText) {
		String prompt = """
				Analyze the following resume.

				Extract:
				- Candidate name
				- Email address
				- Professional summary
				- Technical and professional skills
				- Education
				- Work experience and internships
				- Projects

				Rules:
				1. Return only valid JSON.
				2. Do not use Markdown or code fences.
				3. Do not invent information absent from the resume.
				4. Use an empty string for missing name, email, or summary.
				5. Use empty arrays for missing lists.
				6. Keep every list item as a string.

				Required JSON structure:
				{
				  "candidateName": "string",
				  "email": "string",
				  "summary": "string",
				  "skills": ["string"],
				  "education": ["string"],
				  "experience": ["string"],
				  "projects": ["string"]
				}

				Resume text:
				%s
				""".formatted(resumeText);
		
		String json = gservice.generateCareerGuidance(prompt);
		
		// Clean code block fences if Gemini wrapped output in ```json ... ```
		String cleanJson = json != null ? json.trim() : "";
		if (cleanJson.startsWith("```")) {
			cleanJson = cleanJson.replaceAll("(?s)^\\s*```(?:json)?|```\\s*$", "").trim();
		}

		int firstBrace = cleanJson.indexOf('{');
		int lastBrace = cleanJson.lastIndexOf('}');
		if (firstBrace >= 0 && lastBrace > firstBrace) {
			cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
		}
		
		try {
			return omapper.readValue(cleanJson, ResumeAnalysisResponse.class);
		} catch (Exception e) {
			throw new IllegalStateException("Failed to parse resume analysis JSON: " + e.getMessage(), e);
		}
	}
}
