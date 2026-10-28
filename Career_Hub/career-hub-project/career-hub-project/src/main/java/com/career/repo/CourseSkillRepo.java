package com.career.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.entity.CourseSkill;

public interface CourseSkillRepo extends JpaRepository<CourseSkill, Integer> {

	List<CourseSkill> findBySkillSkillId(Integer sid);
	
	List<CourseSkill> findByCourseCourseId(Integer cid);
	
	Boolean existsByCourseCourseIdAndSkillSkillId(Integer cid, Integer sid);
	
	
}
