package com.school.controller;

import com.school.entity.FeePayment;
import com.school.entity.Student;
import com.school.entity.User;
import com.school.repository.FeePaymentRepository;
import com.school.repository.StudentRepository;
import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    @Autowired private FeePaymentRepository feeRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','PRINCIPAL')")
    public List<FeePayment> getAll() {
        return feeRepo.findAll();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','PRINCIPAL')")
    public List<FeePayment> getByStudent(@PathVariable Long studentId) {
        return feeRepo.findByStudentId(studentId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLERK')")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> body, Authentication auth) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Student student = studentRepo.findById(studentId).orElseThrow();
        User clerk = userRepo.findByUsername(auth.getName()).orElseThrow();
        FeePayment fee = new FeePayment(null, student,
                Double.valueOf(body.get("amount").toString()),
                LocalDate.now(),
                (String) body.get("feeType"),
                "PAID", clerk);
        return ResponseEntity.ok(feeRepo.save(fee));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK')")
    public ResponseEntity<?> markPaid(@PathVariable Long id) {
        return feeRepo.findById(id).map(fee -> {
            fee.setStatus("PAID");
            fee.setPaymentDate(LocalDate.now());
            return ResponseEntity.ok(feeRepo.save(fee));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!feeRepo.existsById(id)) return ResponseEntity.notFound().build();
        feeRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
