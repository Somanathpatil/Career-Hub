package com.career.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.dto.JobMatchingResponse;
import com.career.entity.JobSkill;
import com.career.entity.Jobs;
import com.career.entity.UserSkill;
import com.career.repo.JobSkillRepo;
import com.career.repo.JobsRepo;
import com.career.repo.UserSkillRepo;

@Service
public class JobMatchingService {
	
	@Autowired
	UserSkillRepo usrepo;
	
	@Autowired
	JobSkillRepo jsrepo;
	
	@Autowired
	JobsRepo jrepo;

	
	public JobMatchingResponse calculateMatch(Integer uid, Integer jid) {

	    List<UserSkill> userSkills =
	            usrepo.findByUserUserId(uid);

	    List<JobSkill> jobSkills =
	            jsrepo.findByJobJobId(jid);

	    Jobs job = jrepo.findById(jid)
	            .orElseThrow(() -> new RuntimeException("Job Not Found"));

	    Set<Integer> userSkillIds = new HashSet<>();

	    // Store each skill ID and its level
	    Map<Integer, String> userSkillLevels = new HashMap<>();

	    for (UserSkill us : userSkills) {
	        Integer skillId = us.getSkill().getSkillId();

	        userSkillIds.add(skillId);
	        userSkillLevels.put(skillId, us.getLevel());
	    }

	    List<String> matchedSkills = new ArrayList<>();
	    List<String> missingSkills = new ArrayList<>();
	    List<String> skillGaps = new ArrayList<>();

	    for (JobSkill js : jobSkills) {

	        Integer skillId = js.getSkill().getSkillId();
	        String skillName = js.getSkill().getSkillName();
	        String requiredLevel = js.getRequiredLevel();

	        if (!userSkillIds.contains(skillId)) {

	            missingSkills.add(skillName);

	        } else {

	            String userLevel = userSkillLevels.get(skillId);

	            if (getLevelValue(userLevel) >=
	                    getLevelValue(requiredLevel)) {

	                matchedSkills.add(skillName);

	            } else {

	                skillGaps.add(
	                    skillName + " - Required: " + requiredLevel
	                    + ", Your level: " + userLevel
	                );
	            }
	        }
	    }

	    double matchScore = 0;

	    if (!jobSkills.isEmpty()) {
	        matchScore = matchedSkills.size() * 100.0
	                / jobSkills.size();
	    }

	    JobMatchingResponse response = new JobMatchingResponse();

	    response.setJobId(job.getJobId());
	    response.setTitle(job.getJobTitle());
	    response.setMatchScoure(
	        Math.round(matchScore * 100.0) / 100.0
	    );
	    response.setMatchingSkills(matchedSkills);
	    response.setMissingSkills(missingSkills);
	    response.setSkillGaps(skillGaps);

	    return response;
	}
	
	
	private int getLevelValue(String level) {

	    if (level == null) {
	        return 0;
	    }

	    switch (level.toUpperCase()) {
	        case "BEGINNER":
	            return 1;

	        case "INTERMEDIATE":
	            return 2;

	        case "ADVANCED":
	            return 3;

	        case "EXPERT":
	            return 4;

	        default:
	            throw new IllegalArgumentException(
	                "Invalid skill level: " + level
	            );
	    }
	}
	
	
}
