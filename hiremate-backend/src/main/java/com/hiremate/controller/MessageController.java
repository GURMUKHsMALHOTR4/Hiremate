package com.hiremate.controller;

import com.hiremate.dto.ConversationDto;
import com.hiremate.dto.MessageDto;
import com.hiremate.security.CustomUserDetails;
import com.hiremate.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MessageController {

    @Autowired
    private MessageService svc;

    // ✅ List all conversations of the logged-in user
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> listConversations(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long currentUserId = userDetails.getId();
        return ResponseEntity.ok(svc.listConversations(currentUserId));
    }

    // ✅ Get full chat history with a specific user
    @GetMapping("/conversations/{peerId}/messages")
    public ResponseEntity<List<MessageDto>> getChat(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long peerId) {
        Long currentUserId = userDetails.getId();
        return ResponseEntity.ok(svc.getChat(currentUserId, peerId));
    }

    // ✅ Get paginated chat history (optional)
    @GetMapping("/conversations/{peerId}/messages/paginated")
    public ResponseEntity<List<MessageDto>> getChatPaginated(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long peerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long currentUserId = userDetails.getId();
        return ResponseEntity.ok(svc.getChatPaginated(currentUserId, peerId, page, size));
    }

    // ✅ Post a new message
    @PostMapping("/conversations/{peerId}/messages")
    public ResponseEntity<MessageDto> postMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long peerId,
            @RequestBody Map<String, String> body) {

        Long currentUserId = userDetails.getId();
        String text = body.get("text");

        return ResponseEntity.ok(svc.postMessage(currentUserId, peerId, text));
    }
}
