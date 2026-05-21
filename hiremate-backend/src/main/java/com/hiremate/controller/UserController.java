package com.hiremate.controller;

import com.hiremate.dto.LoginRequest;
import com.hiremate.model.User;
import com.hiremate.repository.UserRepository;
import com.hiremate.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ Register a new user
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("📩 Incoming registration payload: " + user);

        try {
            Optional<User> existingUsername = userRepository.findByUsername(user.getUsername());
            Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());

            if (existingUsername.isPresent()) {
                System.out.println("⚠️ Username already exists: " + user.getUsername());
                return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
            }

            if (existingEmail.isPresent()) {
                System.out.println("⚠️ Email already registered: " + user.getEmail());
                return ResponseEntity.status(409).body(Map.of("message", "Email is already registered."));
            }

            if (user.getRole() == null || user.getRole().trim().isEmpty()) {
                System.out.println("⚠️ Role missing in payload");
                return ResponseEntity.badRequest().body(Map.of("message", "User role is required."));
            }

            String normalizedRole = user.getRole().trim().toUpperCase();
            user.setRole(normalizedRole);

            // ✅ Correct: encode password directly without prefix
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // ✅ Assign employerId only if role is RECRUITER
            if ("RECRUITER".equals(normalizedRole)) {
                long employerId = userRepository.count() + 1;
                user.setEmployerId(employerId);
            }

            userRepository.save(user);
            System.out.println("✅ User saved successfully: " + user.getUsername());
            return ResponseEntity.ok(Map.of("message", "User registered successfully!"));

        } catch (Exception e) {
            System.err.println("❌ Error during registration: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error during registration."));
        }
    }

    // ✅ Login endpoint
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 Login attempt for username: " + request.getUsername());

        try {
            // 🔐 Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            String token = jwtUtil.generateToken(authentication.getName());

            Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());
            if (optionalUser.isEmpty()) {
                System.out.println("⚠️ User not found: " + request.getUsername());
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            User user = optionalUser.get();

            // ✅ Prepare response payload
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("employerId", user.getEmployerId());

            System.out.println("✅ Login successful for: " + user.getUsername());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Authentication error: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }
    }
}
