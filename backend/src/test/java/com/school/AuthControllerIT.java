package com.school;

import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerIT extends AbstractIT {

    @Test
    void validLoginReturnsTokenAndRole() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.username").value("admin"));
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"admin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unknownUserIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"ghost\",\"password\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }
}
