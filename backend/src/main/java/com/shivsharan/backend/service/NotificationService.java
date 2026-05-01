package com.shivsharan.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.shivsharan.backend.model.Submission;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyUser(Submission sub) {
        // send to user-specific destination; user might be null in dev mode
        String user = sub.getUser() == null ? "anonymous" : String.valueOf(sub.getUser().getId());
        messagingTemplate.convertAndSendToUser(user, "/queue/submission-result", sub);
    }
}
