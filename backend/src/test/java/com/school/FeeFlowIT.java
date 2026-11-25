package com.school;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end fee lifecycle through the HTTP layer:
 * Send Bill (BILLED) -> Mark Paid (PAID), plus the pending-settle upsert.
 */
class FeeFlowIT extends AbstractIT {

    private long anyStudentId(String token) throws Exception {
        String res = mvc.perform(get("/api/students").header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res).get(0).get("id").asLong();
    }

    @Test
    void sendBillCreatesBilledRecordThenMarkPaidSettlesIt() throws Exception {
        String token = adminToken();
        long sid = anyStudentId(token);

        // Send Bill -> a BILLED record is created and returned
        String billRes = mvc.perform(post("/api/fees/bill").header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("{\"studentId\":" + sid + ",\"feeType\":\"Transport Fee\",\"amount\":2000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fee.status").value("BILLED"))
                .andReturn().getResponse().getContentAsString();
        long feeId = json.readTree(billRes).get("fee").get("id").asLong();

        // Mark Paid -> same record flips to PAID
        mvc.perform(patch("/api/fees/" + feeId + "/pay").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void payingAnOutstandingTypeSettlesInPlaceWithoutDuplicate() throws Exception {
        String token = adminToken();
        long sid = anyStudentId(token);

        // Bill a fresh type
        String billRes = mvc.perform(post("/api/fees/bill").header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("{\"studentId\":" + sid + ",\"feeType\":\"Hostel Fee\",\"amount\":3000}"))
                .andReturn().getResponse().getContentAsString();
        long billedId = json.readTree(billRes).get("fee").get("id").asLong();

        // Pay the same type via POST /fees -> should settle the existing record, not duplicate
        String payRes = mvc.perform(post("/api/fees").header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("{\"studentId\":" + sid + ",\"feeType\":\"Hostel Fee\",\"amount\":3000}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode paid = json.readTree(payRes);
        assertEquals("PAID", paid.get("status").asText());
        assertEquals(billedId, paid.get("id").asLong(), "should reuse the billed record, not create a new one");
    }

    @Test
    void clerkCanProcessPaymentButPrincipalCannot() throws Exception {
        long sid = anyStudentId(adminToken());
        String payload = "{\"studentId\":" + sid + ",\"feeType\":\"Lab Fee\",\"amount\":1200}";

        mvc.perform(post("/api/fees").header("Authorization", "Bearer " + clerkToken())
                        .contentType("application/json").content(payload))
                .andExpect(status().isOk());

        mvc.perform(post("/api/fees").header("Authorization", "Bearer " + principalToken())
                        .contentType("application/json").content(payload))
                .andExpect(status().isForbidden());
    }
}
