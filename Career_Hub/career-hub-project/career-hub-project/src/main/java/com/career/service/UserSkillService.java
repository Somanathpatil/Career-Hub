package com.career.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.entity.Skills;
import com.career.entity.UserSkill;
import com.career.entity.Users;
import com.career.repo.SkillsRepo;
import com.career.repo.UserSkillRepo;
import com.career.repo.UsersRepo;

@Service
public class UserSkillService {

	@Autowired
	UserSkillRepo usrepo;
	
	@Autowired
	UsersRepo urepo;
	
	
	@Autowired
	SkillsRepo srepo;
	

	
	
	public UserSkill saveUserSkill(UserSkill userskill) {
		
		Users users = urepo.findById(userskill.getUser().getUserId())
		        .orElseThrow(() -> new RuntimeException("User not found"));

		Skills skills = srepo.findById(userskill.getSkill().getSkillId())
		        .orElseThrow(() -> new RuntimeException("Skill not found"));
		
		userskill.setUser(users);
		userskill.setSkill(skills);
		
		return usrepo.save(userskill);
	}
	
	public List<UserSkill> getAllUserSkill(Integer uid){
		return usrepo.findByUserUserId(uid);
	}
	
	
}
