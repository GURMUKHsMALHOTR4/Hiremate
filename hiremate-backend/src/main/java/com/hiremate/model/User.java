package com.hiremate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
@Column(nullable = false)
private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "employer_id", unique = true)
    private Long employerId;

    @Column(nullable = false)
    private String role; // JOB_SEEKER or RECRUITER

    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Job> postedJobs = new HashSet<>();

    @Transient
    @JsonIgnore
    private boolean applied;

    public User() {}

    public User(Long id, String username, String password, String email, Long employerId, String role, Set<Role> roles) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.employerId = employerId;
        this.role = role;
        this.roles = roles;
    }

    public User(String username, String password, String email, Long employerId, String role, Set<Role> roles) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.employerId = employerId;
        this.role = role;
        this.roles = roles;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }

    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public Long getEmployerId() { return employerId; }

    public void setEmployerId(Long employerId) { this.employerId = employerId; }

    public String getRole() { return role; }

    public void setRole(String role) { this.role = role; }

    public Set<Role> getRoles() { return roles; }

    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public Set<Job> getPostedJobs() { return postedJobs; }

    public void setPostedJobs(Set<Job> postedJobs) { this.postedJobs = postedJobs; }

    public boolean isApplied() { return applied; }

    public void setApplied(boolean applied) { this.applied = applied; }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", employerId=" + employerId +
                ", role='" + role + '\'' +
                ", roles=" + (roles != null ? roles.size() : "null") +
                '}';
    }
}
