package com.career.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.career.entity.Course;

public interface CourseRepo extends JpaRepository<Course, Integer> {

    Optional<Course> findByTitleIgnoreCase(String title);

    Optional<Course> findByUrl(String url);

    boolean existsByUrl(String url);

    boolean existsByTitleIgnoreCase(String title);
}
