package com.career.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roadmapId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Jobs job;

    private String title;

    private String status = "IN_PROGRESS";
}