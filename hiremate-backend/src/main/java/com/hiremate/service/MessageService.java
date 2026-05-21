package com.hiremate.service;

import com.hiremate.dto.ConversationDto;
import com.hiremate.dto.MessageDto;
import com.hiremate.model.Message;
import com.hiremate.model.User;
import com.hiremate.repository.MessageRepository;
import com.hiremate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository msgRepo;

    @Autowired
    private UserRepository userRepo;

    // ✅ List recent conversations (latest message per peer)
    public List<ConversationDto> listConversations(Long me) {
        List<Message> all = msgRepo.findBySenderIdOrRecipientId(me, me);
        Map<Long, Message> lastByPeer = new HashMap<>();

        for (Message m : all) {
            Long peer = m.getSenderId().equals(me) ? m.getRecipientId() : m.getSenderId();
            if (!lastByPeer.containsKey(peer) || m.getSentAt().isAfter(lastByPeer.get(peer).getSentAt())) {
                lastByPeer.put(peer, m);
            }
        }

        return lastByPeer.entrySet().stream()
                .map(e -> {
                    Long peer = e.getKey();
                    Message m = e.getValue();
                    User u = userRepo.findById(peer).orElse(null);
                    if (u == null) return null;

                    ConversationDto dto = new ConversationDto();
                    dto.setUserId(peer);
                    dto.setUsername(u.getUsername());
                    dto.setLastMessage(m.getText());
                    dto.setUpdatedAt(m.getSentAt());
                    return dto;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(ConversationDto::getUpdatedAt).reversed())
                .collect(Collectors.toList());
    }

    // ✅ Fetch all messages between two users
    public List<MessageDto> getChat(Long me, Long peer) {
        return msgRepo.findChat(me, peer).stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(MessageDto::getSentAt))
                .collect(Collectors.toList());
    }

    // ✅ Paginated chat fetch
    public List<MessageDto> getChatPaginated(Long me, Long peer, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return msgRepo.findChatPaginated(me, peer, pageable).stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(MessageDto::getSentAt))
                .collect(Collectors.toList());
    }

    // ✅ Send a message
    public MessageDto postMessage(Long me, Long peer, String text) {
        Message m = new Message();
        m.setSenderId(me);
        m.setRecipientId(peer);
        m.setText(text);
        m.setSentAt(LocalDateTime.now());
        Message saved = msgRepo.save(m);
        return toDto(saved);
    }

    // ✅ Mapper from Message to DTO
    private MessageDto toDto(Message m) {
        MessageDto d = new MessageDto();
        d.setId(m.getId());
        d.setSenderId(m.getSenderId());
        d.setRecipientId(m.getRecipientId());
        d.setText(m.getText());
        d.setSentAt(m.getSentAt());
        return d;
    }
}
