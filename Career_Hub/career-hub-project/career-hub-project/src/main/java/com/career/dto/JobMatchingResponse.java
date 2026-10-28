package com.career.dto;

import java.util.List;

import lombok.Data;


@Data
public class JobMatchingResponse {

	private Integer jobId;
	private String title;
	private Double matchScoure;
	private List<String> matchingSkills;
	private List<String> missingSkills;
	private List<String> skillGaps;
	
}
