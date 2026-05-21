package com.hiremate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Refers to the job seeker (not the recruiter)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // ✅ Refers to the job that the user applied for
    @Column(name = "job_id", nullable = false)
    private Long jobId;

    // ✅ Stores the resume file name uploaded by the applicant
    @Column(name = "resume_filename")
    private String resumeFilename;

    // ✅ Tracks current status of application: PENDING, ACCEPTED, or REJECTED
    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    // ✅ Indicates whether the recruiter has seen this application
    @Column(name = "viewed", nullable = false)
    private boolean viewed = false;

    // --- Constructors ---

    public Application() {}

    public Application(Long userId, Long jobId, String resumeFilename) {
        this.userId = userId;
        this.jobId = jobId;
        this.resumeFilename = resumeFilename;
        this.status = "PENDING";
        this.viewed = false;
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getResumeFilename() {
        return resumeFilename;
    }

    public void setResumeFilename(String resumeFilename) {
        this.resumeFilename = resumeFilename;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isViewed() {
        return viewed;
    }

    public void setViewed(boolean viewed) {
        this.viewed = viewed;
    }
}
