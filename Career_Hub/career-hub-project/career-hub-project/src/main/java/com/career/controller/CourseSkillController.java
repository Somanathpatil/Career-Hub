package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.career.entity.CourseSkill;
import com.career.service.CourseSkillService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/courseskill")
public class CourseSkillController {

    @Autowired
    private CourseSkillService courseSkillService;

    @PostMapping("/add")
    public CourseSkill addCourseSkill(
            @RequestBody CourseSkill courseSkill) {
        return courseSkillService.addCourseSkill(courseSkill);
    }

    @GetMapping("/skill/{skillId}")
    public List<CourseSkill> getCoursesBySkill(
            @PathVariable Integer skillId) {
        return courseSkillService.getCoursesBySkill(skillId);
    }
}