package com.hiremate.dto;

public class ReviewRequest {
    private Long applicationId;
    private String status; // Should be "ACCEPTED" or "REJECTED"

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
