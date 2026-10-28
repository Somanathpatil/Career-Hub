package com.career.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.career.entity.UserSkill;

@Repository
public interface UserSkillRepo extends JpaRepository<UserSkill, Integer>{

	
	 List<UserSkill> findByUserUserId(Integer userId);
	 
	 
	 Boolean existsByUserUserIdAndSkillSkillId(Integer uid, Integer sid);
	 
	 
	 Optional<UserSkill> findByUserUserIdAndSkillSkillId(Integer uid, Integer sid);
	
}
