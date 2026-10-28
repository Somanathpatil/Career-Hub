package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.entity.Skills;
import com.career.service.SkillsService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/skills")
public class SkillsController {

	
	@Autowired
	SkillsService sservice;
	
	@PostMapping("/add")
	public Skills addSkill(@RequestBody Skills skill) {
		return sservice.saveSkills(skill);
	}
	
	@GetMapping("/")
	public List<Skills> viewAllSkills() {
		return sservice.getAllSkills();
	}
	
	
	
	
}
