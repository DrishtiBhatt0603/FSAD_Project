package com.school;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Base for web-layer integration tests. Boots the full app against an in-memory DB
 * (seeded by DataSeeder with admin/teacher1/clerk1/principal accounts) and exposes a
 * helper to log in and obtain a JWT for a given seeded user.
 */
@SpringBootTest
@AutoConfigureMockMvc
abstract class AbstractIT {

    @Autowired protected MockMvc mvc;
    @Autowired protected ObjectMapper json;

    protected String tokenFor(String username, String password) throws Exception {
        String body = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
        String res = mvc.perform(post("/api/auth/login")
                        .contentType("application/json").content(body))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("token").asText();
    }

    // Convenience tokens for the seeded accounts
    protected String adminToken()     throws Exception { return tokenFor("admin", "admin123"); }
    protected String teacherToken()   throws Exception { return tokenFor("teacher1", "teacher123"); }
    protected String clerkToken()     throws Exception { return tokenFor("clerk1", "clerk123"); }
    protected String principalToken() throws Exception { return tokenFor("principal", "principal123"); }
}
