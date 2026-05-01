package com.shivsharan.backend.service;

import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * In-process job queue service for asynchronous submission judging
 */
@Service
public class JobQueueService {

    private static final Logger logger = LoggerFactory.getLogger(JobQueueService.class);
    private static final int QUEUE_CAPACITY = 1024;

    private final BlockingQueue<UUID> queue = new ArrayBlockingQueue<>(QUEUE_CAPACITY);
    private final AtomicBoolean running = new AtomicBoolean(false);
    private Thread workerThread;

    @Autowired
    private JudgeService judgeService;

    /**
     * Enqueue a submission for judging
     * @param submissionId ID of the submission to judge
     */
    public void enqueue(UUID submissionId) {
        boolean offered = queue.offer(submissionId);
        if (!offered) {
            logger.warn("Job queue full, falling back to direct execution for submission: {}",
                    submissionId);
            // fallback: run direct if queue full
            judgeService.judge(submissionId);
        } else {
            logger.debug("Enqueued submission for judging: {}", submissionId);
        }
    }

    /**
     * Start the job queue worker thread
     */
    @PostConstruct
    public void start() {
        logger.info("Starting JobQueueService worker thread");
        running.set(true);
        workerThread = new Thread(() -> {
            logger.info("Job queue worker thread started");
            while (running.get()) {
                try {
                    UUID id = queue.take(); // Blocking take
                    logger.debug("Processing submission from queue: {}", id);
                    judgeService.judge(id);
                } catch (InterruptedException e) {
                    if (running.get()) {
                        logger.warn("Job queue worker interrupted", e);
                    }
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception ex) {
                    logger.error("JobQueue worker error", ex);
                    // Continue processing other jobs
                }
            }
            logger.info("Job queue worker thread stopped");
        }, "job-queue-worker");
        workerThread.setDaemon(true);
        workerThread.start();
    }

    /**
     * Stop the job queue worker thread
     */
    @PreDestroy
    public void stop() {
        logger.info("Stopping JobQueueService");
        running.set(false);
        if (workerThread != null) {
            workerThread.interrupt();
            try {
                workerThread.join(5000); // Wait up to 5 seconds for graceful shutdown
            } catch (InterruptedException e) {
                logger.warn("Interrupted while waiting for worker thread shutdown", e);
                Thread.currentThread().interrupt();
            }
        }
        logger.info("JobQueueService stopped");
    }

    /**
     * Get current queue size
     * @return Number of submissions in queue
     */
    public int getQueueSize() {
        return queue.size();
    }

    /**
     * Get remaining queue capacity
     * @return Remaining capacity
     */
    public int getRemainingCapacity() {
        return queue.remainingCapacity();
    }
}
