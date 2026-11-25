package com.school.repository;

import com.school.entity.FeePayment;
import com.school.entity.Student;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository-slice tests for the custom derived queries used by the fee flow.
 * Uses an embedded DB and only the JPA layer (no web/security).
 */
@DataJpaTest
class FeeRepositoryTest {

    @Autowired private FeePaymentRepository feeRepo;
    @Autowired private StudentRepository studentRepo;

    private Student newStudent(String name, String cls) {
        return studentRepo.save(new Student(null, name, "Parent", "Addr", cls, "A",
                "7th - 80%", LocalDate.now(), name.toLowerCase() + "@example.com", null));
    }

    @Test
    void findsOutstandingFeeByStudentTypeAndStatus() {
        Student s = newStudent("Test One", "8A");
        feeRepo.save(new FeePayment(null, s, 500.0, null, "Library Fee", "PENDING", null, null));

        List<FeePayment> pending = feeRepo.findByStudentIdAndFeeTypeAndStatus(s.getId(), "Library Fee", "PENDING");
        assertEquals(1, pending.size());
        assertTrue(feeRepo.findByStudentIdAndFeeTypeAndStatus(s.getId(), "Library Fee", "PAID").isEmpty());
    }

    @Test
    void findsBilledFeesOlderThanCutoff() {
        Student s = newStudent("Test Two", "9A");
        feeRepo.save(new FeePayment(null, s, 800.0, null, "Sports Fee", "BILLED",
                LocalDate.now().minusDays(3).atStartOfDay(), null));

        // Overdue relative to "2 days ago" cutoff
        var overdue = feeRepo.findByStatusAndBilledAtBefore("BILLED", LocalDate.now().minusDays(2).atStartOfDay());
        assertEquals(1, overdue.size());
        // Not overdue relative to "5 days ago" cutoff
        assertTrue(feeRepo.findByStatusAndBilledAtBefore("BILLED",
                LocalDate.now().minusDays(5).atStartOfDay()).isEmpty());
    }

    @Test
    void deleteByStudentRemovesAllTheirFees() {
        Student s = newStudent("Test Three", "10A");
        feeRepo.save(new FeePayment(null, s, 5000.0, LocalDate.now(), "Tuition Fee", "PAID", null, null));
        feeRepo.save(new FeePayment(null, s, 500.0, LocalDate.now(), "Library Fee", "PAID", null, null));
        assertEquals(2, feeRepo.findByStudentId(s.getId()).size());

        feeRepo.deleteByStudent(s);
        assertTrue(feeRepo.findByStudentId(s.getId()).isEmpty());
    }
}
