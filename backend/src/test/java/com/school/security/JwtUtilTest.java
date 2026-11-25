package com.school.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JWT creation/validation — no Spring context, fields injected by reflection.
 */
class JwtUtilTest {

    private JwtUtil jwt;

    @BeforeEach
    void setUp() {
        jwt = new JwtUtil();
        ReflectionTestUtils.setField(jwt, "secret", "SchoolAdminSystemSecretKey2024VeryLongSecretForJWTSigning");
        ReflectionTestUtils.setField(jwt, "expiration", 86_400_000L);
    }

    @Test
    void generatedTokenCarriesUsernameAndRole() {
        String token = jwt.generateToken("admin", "ADMIN");
        assertTrue(jwt.validateToken(token));
        assertEquals("admin", jwt.extractUsername(token));
        assertEquals("ADMIN", jwt.extractRole(token));
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwt.generateToken("clerk1", "CLERK");
        assertFalse(jwt.validateToken(token + "x"));
    }

    @Test
    void garbageTokenIsRejected() {
        assertFalse(jwt.validateToken("not-a-real-jwt"));
    }

    @Test
    void expiredTokenIsRejected() {
        // Negative expiry => token already expired the moment it's created
        ReflectionTestUtils.setField(jwt, "expiration", -1000L);
        String expired = jwt.generateToken("teacher1", "TEACHER");
        assertFalse(jwt.validateToken(expired));
    }
}
