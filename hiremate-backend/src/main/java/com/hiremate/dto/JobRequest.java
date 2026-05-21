package com.hiremate.dto;

public class JobRequest {
    private String title;
    private String description;
    private String location;
    private String company;
    private String salary;
    private Long employerId;

    // --- Constructors ---
    public JobRequest() {}

    public JobRequest(String title, String description, String location, String company, String salary, Long employerId) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.company = company;
        this.salary = salary;
        this.employerId = employerId;
    }

    // --- Getters and Setters ---
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public Long getEmployerId() {
        return employerId;
    }

    public void setEmployerId(Long employerId) {
        this.employerId = employerId;
    }

    // --- toString (Optional for debugging) ---
    @Override
    public String toString() {
        return "JobRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", location='" + location + '\'' +
                ", company='" + company + '\'' +
                ", salary='" + salary + '\'' +
                ", employerId=" + employerId +
                '}';
    }
}
