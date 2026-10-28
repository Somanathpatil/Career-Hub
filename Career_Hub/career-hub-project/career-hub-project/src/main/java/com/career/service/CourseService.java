package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.career.entity.Course;
import com.career.repo.CourseRepo;

@Service
public class CourseService {

	@Autowired
	CourseRepo crepo;
	
	public Course saveCourse(Course course) {
		return crepo.save(course);
	}
	
	public List<Course> getAllCourse(){
		return crepo.findAll();
	}
	
	public Course getById(Integer cid) {
		return crepo.findById(cid).orElseThrow(() -> new RuntimeException("Course Not Found"));
	}
	
}
