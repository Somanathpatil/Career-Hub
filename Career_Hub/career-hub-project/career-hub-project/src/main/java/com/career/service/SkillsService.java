package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.entity.Skills;
import com.career.repo.SkillsRepo;

@Service
public class SkillsService {
	
	@Autowired
	SkillsRepo srepo;


	public Skills saveSkills(Skills skills) {
		return srepo.save(skills);
	}


	public List<Skills> getAllSkills() {
		// TODO Auto-generated method stub
		return srepo.findAll();
	}

}
