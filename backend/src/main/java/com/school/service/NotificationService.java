package com.school.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends fee notifications by email. When mail is configured (app.mail.enabled=true plus
 * spring.mail.* SMTP settings) a real email is sent to the student's address. If mail is
 * not configured it falls back to logging so the billing flow still works in a demo.
 */
@Service
public class NotificationService {

    @Autowired(required = false) private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@schooladmin.local}")
    private String from;

    public record Result(boolean sent, boolean simulated, String channel, String detail) {}

    public Result notify(String toEmail, String subject, String body) {
        if (toEmail == null || toEmail.isBlank()) {
            return new Result(false, false, "email", "No email address on record for this student.");
        }
        if (!mailEnabled || mailSender == null) {
            System.out.printf("[EMAIL-SIMULATED] to=%s | %s | %s%n", toEmail, subject, body);
            return new Result(true, true, "email",
                    "Email simulated to " + toEmail + " (mail not configured — set app.mail.enabled + spring.mail.*).");
        }
        // Send on a background thread so the HTTP request (and the UI button) returns immediately.
        new Thread(() -> {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(from);
                msg.setTo(toEmail);
                msg.setSubject(subject);
                msg.setText(body);
                mailSender.send(msg);
                System.out.printf("[EMAIL-SENT] to=%s | %s%n", toEmail, subject);
            } catch (Exception e) {
                System.out.printf("[EMAIL-FAILED] to=%s : %s%n", toEmail, e.getMessage());
            }
        }, "mail-send").start();
        return new Result(true, false, "email", "Email is being sent to " + toEmail + ".");
    }
}
