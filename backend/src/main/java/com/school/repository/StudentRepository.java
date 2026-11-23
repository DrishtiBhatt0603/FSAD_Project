package com.school.repository;

import com.school.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByClassName(String className);
    List<Student> findByNameContainingIgnoreCase(String name);
}
