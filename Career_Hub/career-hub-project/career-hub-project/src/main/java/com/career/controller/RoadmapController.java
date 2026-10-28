package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.career.dto.RoadmapProgressResponse;
import com.career.entity.Roadmap;
import com.career.entity.RoadmapStep;
import com.career.service.RoadmapService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    @Autowired
    private RoadmapService roadmapService;

    @PostMapping("/generate/{userId}/{jobId}")
    public ResponseEntity<Roadmap> generateRoadmap(
            @PathVariable Integer userId,
            @PathVariable Integer jobId) {

        Roadmap roadmap =
                roadmapService.generateRoadmap(userId, jobId);

        return ResponseEntity.ok(roadmap);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Roadmap>> getUserRoadmaps(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                roadmapService.getUserRoadmaps(userId)
        );
    }

    @GetMapping("/{roadmapId}/steps")
    public ResponseEntity<List<RoadmapStep>> getRoadmapSteps(
            @PathVariable Integer roadmapId) {

        return ResponseEntity.ok(
                roadmapService.getRoadmapSteps(roadmapId)
        );
    }
    
    
    @PutMapping("/steps/{stepId}/complete")
    public ResponseEntity<RoadmapStep> completeStep(
            @PathVariable Integer stepId) {

        return ResponseEntity.ok(
                roadmapService.completeStep(stepId));
    }

    @PutMapping("/steps/{stepId}/reopen")
    public ResponseEntity<RoadmapStep> reopenStep(
            @PathVariable Integer stepId) {

        return ResponseEntity.ok(
                roadmapService.reopenStep(stepId));
    }

    @GetMapping("/{roadmapId}/progress")
    public ResponseEntity<RoadmapProgressResponse> getProgress(
            @PathVariable Integer roadmapId) {

        return ResponseEntity.ok(
                roadmapService.getProgress(roadmapId));
    }
    
    
    
}