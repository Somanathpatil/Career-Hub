package com.career.service;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.dto.SaveResumeSkillsRequest;
import com.career.dto.SkillLevelDTO;
import com.career.entity.Skills;
import com.career.entity.UserSkill;
import com.career.entity.Users;
import com.career.repo.SkillsRepo;
import com.career.repo.UserSkillRepo;
import com.career.repo.UsersRepo;

import jakarta.transaction.Transactional;

@Service
public class ResumeSKillSaveService {
	
	@Autowired
    private UserSkillRepo usRepo;
	
	@Autowired
    private SkillsRepo sRepo;
	
	@Autowired
    private UsersRepo uRepo;

	private static final Set<String> VALID_LEVELS = Set.of(
			"BEGINNER",
            "INTERMEDIATE",
            "ADVANCED",
            "EXPERT"
			);
	
	
	@Transactional
	public String saveApprovedSkills(SaveResumeSkillsRequest req) {
		
		
		if(req.getUid() == null || req.getSkill() == null) {
			throw new IllegalArgumentException("User Id and Skill are Required");
		}
		
		Users users = uRepo.findById(req.getUid()).orElseThrow(() -> new RuntimeException("User Not Found"));
		
		for(SkillLevelDTO item : req.getSkill()) {
			
			if (item == null || item.getSkillId() == null
                    || item.getLevel() == null) {
                throw new IllegalArgumentException(
                        "Skill ID and level are required");
            }
			
			
			String level = item.getLevel().trim().toUpperCase();
			
			 if (!VALID_LEVELS.contains(level)) {
	                throw new IllegalArgumentException(
	                        "Invalid skill level: " + item.getLevel());
	            }
			 
			 Skills skills = sRepo.findById(item.getSkillId()).orElseThrow(() -> new RuntimeException("Skill Not Found"));
			 
			 UserSkill userSkill = usRepo.findByUserUserIdAndSkillSkillId(users.getUserId(), item.getSkillId()).orElseGet(UserSkill::new);
			 
			 userSkill.setUser(users);
	            userSkill.setSkill(skills);
	            userSkill.setLevel(level);

	            usRepo.save(userSkill);
	            
			
		}
		
		
		 return "Approved resume skills saved successfully";
	}
	
}
