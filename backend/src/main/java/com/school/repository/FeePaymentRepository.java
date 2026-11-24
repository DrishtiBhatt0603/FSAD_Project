package com.school.repository;

import com.school.entity.FeePayment;
import com.school.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudentId(Long studentId);
    List<FeePayment> findByStatus(String status);
    List<FeePayment> findByStudentIdAndFeeTypeAndStatus(Long studentId, String feeType, String status);
    List<FeePayment> findByStatusAndBilledAtBefore(String status, LocalDateTime cutoff);
    void deleteByStudent(Student student);
}
