package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.entity.Course;
import com.career.entity.CourseSkill;
import com.career.entity.Skills;
import com.career.repo.CourseRepo;
import com.career.repo.CourseSkillRepo;
import com.career.repo.SkillsRepo;

@Service
public class CourseSkillService {

	
	@Autowired
	CourseSkillRepo csrepo;
	
	@Autowired
	CourseRepo crepo;
	
	@Autowired
	SkillsRepo srepo;
	
	
	
	public CourseSkill addCourseSkill(CourseSkill courseSkill) {
		
		if(courseSkill.getCourse() == null || courseSkill.getCourse().getCourseId() == null) {
			throw new IllegalArgumentException("Course Id Is required");
		}
		
		if(courseSkill.getSkill() == null || courseSkill.getSkill().getSkillId() == null) {
			throw new IllegalArgumentException("Skill Id Is reuired");
		}
		
		Integer courseId = courseSkill.getCourse().getCourseId();
		Integer skillId = courseSkill.getSkill().getSkillId();
		
		Course course = crepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course Not Found"));
		Skills skill = srepo.findById(skillId).orElseThrow(() -> new RuntimeException("Skill Not Found"));
		
		if(csrepo.existsByCourseCourseIdAndSkillSkillId(courseId, skillId)) {
			throw new RuntimeException("This skill is already linked to this course");
		}
		
		courseSkill.setCourse(course);
		courseSkill.setSkill(skill);
		
		return csrepo.save(courseSkill);
		
	}
	
	
	public List<CourseSkill> getCoursesBySkill(Integer skillId) {
        return csrepo.findBySkillSkillId(skillId);
    }
	
	
	
}
