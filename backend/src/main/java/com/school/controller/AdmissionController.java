package com.school.controller;

import com.school.entity.Admission;
import com.school.entity.Student;
import com.school.entity.User;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

    @Autowired private AdmissionRepository admissionRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private PerformanceRepository performanceRepo;
    @Autowired private FeePaymentRepository feeRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','PRINCIPAL')")
    public List<Admission> getAll() {
        return admissionRepo.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLERK')")
    public ResponseEntity<?> admit(@RequestBody Map<String, Object> body, Authentication auth) {
        Student student = new Student();
        student.setName((String) body.get("name"));
        student.setParentName((String) body.get("parentName"));
        student.setAddress((String) body.get("address"));
        student.setClassName((String) body.get("className"));
        student.setSection((String) body.get("section"));
        student.setPreviousClassPerformance((String) body.get("previousClassPerformance"));
        student.setEmail((String) body.get("email"));
        student.setPhone((String) body.get("phone"));
        student.setAdmissionDate(LocalDate.now());
        student = studentRepo.save(student);

        User clerk = userRepo.findByUsername(auth.getName()).orElseThrow();
        Admission admission = new Admission(null, student, clerk, LocalDate.now(), "APPROVED");
        return ResponseEntity.ok(admissionRepo.save(admission));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return admissionRepo.findById(id).map(admission -> {
            Student student = admission.getStudent();
            // Remove all records linked to this student before deleting
            attendanceRepo.deleteByStudent(student);
            performanceRepo.deleteByStudent(student);
            feeRepo.deleteByStudent(student);
            admissionRepo.delete(admission);
            studentRepo.delete(student);
            return ResponseEntity.ok(Map.of("message", "Admission and student deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
