package com.career.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.entity.RoadmapStep;

public interface RoadmapStepRepo
        extends JpaRepository<RoadmapStep, Integer> {

    List<RoadmapStep> findByRoadmapRoadmapIdOrderByStepOrderAsc(
            Integer roadmapId);

    long countByRoadmapRoadmapId(Integer roadmapId);

    long countByRoadmapRoadmapIdAndStatus(
            Integer roadmapId, String status);
}