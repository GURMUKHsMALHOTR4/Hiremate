package com.hiremate.repository;

import com.hiremate.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
      SELECT m FROM Message m
      WHERE (m.senderId = :me AND m.recipientId = :peer)
         OR (m.senderId = :peer AND m.recipientId = :me)
      ORDER BY m.sentAt DESC
    """)
    List<Message> findChatPaginated(
        @Param("me") Long me,
        @Param("peer") Long peer,
        Pageable pageable
    );

    @Query("""
      SELECT m FROM Message m
      WHERE (m.senderId = :me AND m.recipientId = :peer)
         OR (m.senderId = :peer AND m.recipientId = :me)
      ORDER BY m.sentAt
    """)
    List<Message> findChat(
        @Param("me") Long me,
        @Param("peer") Long peer
    );

    List<Message> findBySenderIdOrRecipientId(Long sender, Long recipient);
}
