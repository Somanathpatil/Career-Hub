package com.career.dto;

import lombok.Data;

@Data
public class MatchedSkillDTO{
	Integer skillId;
	String skillName;
	public MatchedSkillDTO(Integer skillId, String skillName) {
		super();
		this.skillId = skillId;
		this.skillName = skillName;
	}
	
	
}
