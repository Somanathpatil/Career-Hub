package com.career.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.career.entity.Roadmap;

public interface RoadmapRepo extends JpaRepository<Roadmap, Integer> {

    List<Roadmap> findByUserUserId(Integer userId);
}