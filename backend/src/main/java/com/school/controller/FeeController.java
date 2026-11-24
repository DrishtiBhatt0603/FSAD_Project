package com.school.controller;

import com.school.entity.FeePayment;
import com.school.entity.Student;
import com.school.entity.User;
import com.school.repository.FeePaymentRepository;
import com.school.repository.StudentRepository;
import com.school.repository.UserRepository;
import com.school.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    @Autowired private FeePaymentRepository feeRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private NotificationService notificationService;

    @Value("${app.fee.bill-grace-hours:48}")
    private long graceHours;

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
        String feeType = (String) body.get("feeType");
        double amount = Double.valueOf(body.get("amount").toString());

        // If this fee type is already outstanding (BILLED or PENDING) for the student,
        // settle that record instead of creating a duplicate — paying marks it PAID.
        FeePayment outstanding = firstOutstanding(studentId, feeType);
        if (outstanding != null) {
            outstanding.setStatus("PAID");
            outstanding.setPaymentDate(LocalDate.now());
            outstanding.setAmount(amount);
            outstanding.setProcessedBy(clerk);
            return ResponseEntity.ok(feeRepo.save(outstanding));
        }

        FeePayment fee = new FeePayment(null, student, amount, LocalDate.now(), feeType, "PAID", null, clerk);
        return ResponseEntity.ok(feeRepo.save(fee));
    }

    @PostMapping("/bill")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK')")
    public ResponseEntity<?> sendBill(@RequestBody Map<String, Object> body, Authentication auth) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Student student = studentRepo.findById(studentId).orElseThrow();
        User clerk = userRepo.findByUsername(auth.getName()).orElseThrow();
        String feeType = (String) body.get("feeType");
        double amount = Double.valueOf(body.get("amount").toString());

        // Don't double-bill something already outstanding
        FeePayment existing = firstOutstanding(studentId, feeType);
        FeePayment fee = existing != null ? existing
                : new FeePayment(null, student, amount, null, feeType, "BILLED", LocalDateTime.now(), clerk);
        if (existing == null) {
            fee = feeRepo.save(fee);
        }

        String subject = "Fee Due: " + feeType;
        String emailBody = String.format(
                "Dear %s,%n%nThis is a reminder that your %s of Rs.%,.0f is due.%n"
                + "Kindly pay within %d hours, otherwise it will be marked PENDING in our records.%n%n"
                + "Regards,%nSchool Administration",
                student.getName(), feeType, amount, graceHours);
        NotificationService.Result note = notificationService.notify(student.getEmail(), subject, emailBody);

        return ResponseEntity.ok(Map.of(
                "fee", fee,
                "notified", note.sent(),
                "simulated", note.simulated(),
                "channel", note.channel(),
                "detail", note.detail()));
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

    // Returns an existing PENDING or BILLED record for this student+feeType, or null.
    private FeePayment firstOutstanding(Long studentId, String feeType) {
        List<FeePayment> pending = feeRepo.findByStudentIdAndFeeTypeAndStatus(studentId, feeType, "PENDING");
        if (!pending.isEmpty()) return pending.get(0);
        List<FeePayment> billed = feeRepo.findByStudentIdAndFeeTypeAndStatus(studentId, feeType, "BILLED");
        return billed.isEmpty() ? null : billed.get(0);
    }
}
