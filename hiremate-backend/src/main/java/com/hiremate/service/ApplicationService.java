package com.hiremate.service;

import com.hiremate.model.Application;
import com.hiremate.repository.ApplicationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    // ✅ Mark all applications for a job as viewed
    @Transactional
    public void markApplicationsAsViewed(Long jobId) {
        List<Application> applications = applicationRepository.findByJobId(jobId);
        for (Application application : applications) {
            if (!application.isViewed()) {
                application.setViewed(true);
            }
        }
        applicationRepository.saveAll(applications);
    }

    // ✅ Get all jobIds that a user has applied to (for highlighting in UI)
    public List<Long> getAppliedJobIdsByUser(Long userId) {
        return applicationRepository.findJobIdsByUserId(userId);
    }
}