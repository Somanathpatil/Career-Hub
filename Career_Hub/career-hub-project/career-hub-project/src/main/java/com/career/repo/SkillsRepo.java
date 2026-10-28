package com.career.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.entity.Skills;

public interface SkillsRepo extends JpaRepository<Skills, Integer> {

	Optional<Skills> findBySkillNameIgnoreCase(String skillName);
	
}
