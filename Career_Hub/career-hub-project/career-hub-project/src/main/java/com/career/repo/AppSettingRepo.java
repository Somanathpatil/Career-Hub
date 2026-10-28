package com.career.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.career.entity.AppSetting;

public interface AppSettingRepo extends JpaRepository<AppSetting, String> {
}
