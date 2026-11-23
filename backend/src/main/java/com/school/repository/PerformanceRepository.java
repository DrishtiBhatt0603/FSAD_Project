package com.school.repository;

import com.school.entity.Performance;
import com.school.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByStudentId(Long studentId);
    List<Performance> findByStudentClassName(String className);
    void deleteByStudent(Student student);
}
