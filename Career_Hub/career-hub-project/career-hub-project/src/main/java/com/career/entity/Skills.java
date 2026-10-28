package com.career.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Skills {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer skillId;
	private String skillName;
	
}
