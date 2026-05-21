package com.hiremate.repository;

import com.hiremate.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    List<Application> findByJobId(Long jobId);

    List<Application> findByUserIdAndStatus(Long userId, String status); // ✅ Needed for chat filter

    @Query("SELECT a.jobId FROM Application a WHERE a.userId = :userId")
    List<Long> findJobIdsByUserId(Long userId);

    Optional<Application> findByJobIdAndUserId(Long jobId, Long userId); // ✅ Add this
}
