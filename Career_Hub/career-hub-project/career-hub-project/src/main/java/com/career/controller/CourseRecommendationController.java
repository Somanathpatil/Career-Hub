package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.career.dto.CourseRecommendationResponse;
import com.career.entity.Course;
import com.career.service.CourseRecommendationService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/recommendations")
public class CourseRecommendationController {

    @Autowired
    private CourseRecommendationService crService;

    @GetMapping("/user/{userId}/job/{jobId}")
    public List<CourseRecommendationResponse> recommendCourses(
            @PathVariable Integer userId,
            @PathVariable Integer jobId) {

        return crService.recommendCourses(userId, jobId);
    }
    
}