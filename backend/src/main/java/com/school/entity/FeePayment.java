package com.school.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeePayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private Double amount;
    private LocalDate paymentDate;
    private String feeType;
    private String status;          // PAID | PENDING | BILLED
    private LocalDateTime billedAt;  // when a bill was issued (for the grace-period → PENDING transition)

    @ManyToOne
    @JoinColumn(name = "processed_by")
    private User processedBy;
}
