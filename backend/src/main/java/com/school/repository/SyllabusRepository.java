package com.school.repository;

import com.school.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    List<Syllabus> findByClassName(String className);
    Optional<Syllabus> findByClassNameAndSubject(String className, String subject);
}
