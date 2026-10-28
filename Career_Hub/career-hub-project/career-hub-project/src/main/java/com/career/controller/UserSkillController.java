package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.entity.Skills;
import com.career.entity.UserSkill;
import com.career.service.SkillsService;
import com.career.service.UserSkillService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/userskill")
public class UserSkillController {

	
	@Autowired
	UserSkillService usservice;
	
	@PostMapping("/add")
	public UserSkill addSkill(@RequestBody UserSkill userskill) {
		return usservice.saveUserSkill(userskill);
	}
	
	@GetMapping("/user/{uid}")
	public List<UserSkill> viewAllSkills(@PathVariable Integer uid) {
		return usservice.getAllUserSkill(uid);
	}
	
	
	
	
}
