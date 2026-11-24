package com.school.service;

import com.school.entity.FeePayment;
import com.school.repository.FeePaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Moves fees that were billed (status BILLED) but left unpaid past the grace period
 * (app.fee.bill-grace-hours) into PENDING. Runs shortly after startup and then hourly,
 * so the transition reflects in the database even across restarts.
 */
@Component
public class FeeStatusScheduler {

    @Autowired private FeePaymentRepository feeRepo;

    @Value("${app.fee.bill-grace-hours:48}")
    private long graceHours;

    @Scheduled(initialDelay = 10_000, fixedRate = 3_600_000) // 10s after boot, then every hour
    public void promoteOverdueBills() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(graceHours);
        List<FeePayment> overdue = feeRepo.findByStatusAndBilledAtBefore("BILLED", cutoff);
        if (overdue.isEmpty()) return;
        overdue.forEach(f -> f.setStatus("PENDING"));
        feeRepo.saveAll(overdue);
        System.out.printf("[FeeScheduler] Promoted %d billed fee(s) to PENDING (grace %dh elapsed).%n",
                overdue.size(), graceHours);
    }
}
