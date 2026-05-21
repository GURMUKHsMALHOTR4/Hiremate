package com.hiremate.controller;

import com.hiremate.dto.JobRequest;
import com.hiremate.model.Application;
import com.hiremate.model.Job;
import com.hiremate.model.User;
import com.hiremate.repository.ApplicationRepository;
import com.hiremate.repository.JobRepository;
import com.hiremate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // ✅ Create new job
    @Transactional
    @PostMapping("/create")
    public ResponseEntity<?> createJob(@RequestBody JobRequest jobRequest) {
        if (jobRequest.getEmployerId() == null) {
            return ResponseEntity.badRequest().body("Employer ID is required.");
        }

        Optional<User> employerOpt = userRepository.findById(jobRequest.getEmployerId());
        if (employerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Employer not found for ID: " + jobRequest.getEmployerId());
        }

        Job job = new Job(
            jobRequest.getTitle(),
            jobRequest.getDescription(),
            jobRequest.getLocation(),
            jobRequest.getCompany(),
            jobRequest.getSalary(),
            employerOpt.get()
        );

        Job savedJob = jobRepository.saveAndFlush(job);
        System.out.println("✅ Job created with ID: " + savedJob.getId());

        return ResponseEntity.ok(savedJob); // ✅ Return full job object to frontend
    }

    // ✅ Get jobs by employerId — response expected directly as Job[] with recruiter info via @JsonProperty
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Job>> getJobsByEmployer(@PathVariable Long employerId) {
        List<Job> jobs = jobRepository.findByEmployer_Id(employerId);
        return ResponseEntity.ok(jobs);
    }

    // ✅ Get job by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        return jobOpt.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("❌ Job not found with ID: " + id));
    }

    // ✅ Update job
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job updatedJob) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) return ResponseEntity.status(404).body("Job not found with ID: " + id);

        Job job = jobOpt.get();
        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setLocation(updatedJob.getLocation());
        job.setCompany(updatedJob.getCompany());
        job.setSalary(updatedJob.getSalary());

        jobRepository.save(job);
        return ResponseEntity.ok("Job updated successfully!");
    }

    // ❌ Normal delete (only if no applicants)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) return ResponseEntity.status(404).body("Job not found with ID: " + id);

        List<Application> applications = applicationRepository.findByJobId(id);
        if (!applications.isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot delete job — applicants have already applied.");
        }

        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job deleted successfully!");
    }

    // ✅ Force delete (deletes job + its applications)
    @DeleteMapping("/delete/force/{id}")
    public ResponseEntity<?> forceDeleteJob(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) return ResponseEntity.status(404).body("Job not found with ID: " + id);

        List<Application> applications = applicationRepository.findByJobId(id);
        if (!applications.isEmpty()) {
            applicationRepository.deleteAll(applications);
        }

        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job and its applications deleted successfully!");
    }

    // ✅ Search jobs by title (includes recruiter info using helper map)
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchJobs(@RequestParam String title) {
        List<Job> jobs = jobRepository.findByTitleContainingIgnoreCase(title);
        return ResponseEntity.ok(jobs.stream().map(this::toJobMap).toList());
    }

    // ✅ Get all jobs with recruiter info AND jobseeker status
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllJobsWithApplicants(@RequestParam(required = false) Long userId) {
        List<Job> jobs = jobRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Job job : jobs) {
            Map<String, Object> map = toJobMap(job);

            if (userId != null) {
                applicationRepository.findByJobIdAndUserId(job.getId(), userId).ifPresentOrElse(
                    app -> {
                        map.put("applied", true);
                        map.put("applicationStatus", app.getStatus());
                    },
                    () -> map.put("applied", false)
                );
            }

            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    // ✅ Map job manually when required (used only for old APIs)
    private Map<String, Object> toJobMap(Job job) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", job.getId());
        map.put("title", job.getTitle());
        map.put("description", job.getDescription());
        map.put("location", job.getLocation());
        map.put("company", job.getCompany());
        map.put("salary", job.getSalary());

        if (job.getEmployer() != null) {
            map.put("recruiterId", job.getEmployer().getId());
            map.put("recruiterUsername", job.getEmployer().getUsername());
        }

        return map;
    }
}
