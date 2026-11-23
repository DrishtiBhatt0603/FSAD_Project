package com.school.repository;

import com.school.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByClassName(String className);
    List<ClassSchedule> findByTeacherId(Long teacherId);
}
