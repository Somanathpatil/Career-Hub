package com.career.dto;

import java.util.List;

import lombok.Data;

@Data
public class SaveResumeSkillsRequest {
	private Integer uid;
	private List<SkillLevelDTO> skill;
}


