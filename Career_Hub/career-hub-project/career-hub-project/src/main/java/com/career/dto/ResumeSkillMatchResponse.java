
package com.career.dto;

import java.util.List;

import lombok.Data;

@Data
public class ResumeSkillMatchResponse{
	public ResumeSkillMatchResponse(List<MatchedSkillDTO> matchedSkills, List<String> unmatchedSkills) {
		super();
		this.matchedSkills = matchedSkills;
		this.unmatchedSkills = unmatchedSkills;
	}
	List<MatchedSkillDTO> matchedSkills;
	List<String> unmatchedSkills;
}


