package com.school.repository;

import com.school.entity.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    Optional<Admission> findByStudentId(Long studentId);
    List<Admission> findByStatus(String status);
}
