package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.Application;
import com.conlaboro.entity.Comment;
import com.conlaboro.entity.Project;
import com.conlaboro.entity.Task;
import com.conlaboro.entity.User;
import com.conlaboro.entity.UserBadge;
import com.conlaboro.mapper.ApplicationMapper;
import com.conlaboro.mapper.CommentMapper;
import com.conlaboro.mapper.ProjectMapper;
import com.conlaboro.mapper.TaskMapper;
import com.conlaboro.mapper.UserBadgeMapper;
import com.conlaboro.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeAutoService {

    private final UserBadgeMapper userBadgeMapper;
    private final ApplicationMapper applicationMapper;
    private final CommentMapper commentMapper;
    private final ProjectMapper projectMapper;
    private final UserMapper userMapper;
    private final TaskMapper taskMapper;

    public void checkAndGrant(Long userId, String trigger) {
        switch (trigger) {
            case "project_joined":
                onProjectJoined(userId);
                break;
            case "task_completed":
                onTaskCompleted(userId);
                break;
            case "comment_posted":
                onCommentPosted(userId);
                break;
            case "project_done":
                onProjectDone(userId);
                break;
            case "first_login":
                onFirstLogin(userId);
                break;
            default:
                log.warn("Unknown badge trigger: {} for user {}", trigger, userId);
        }
    }

    @Transactional
    public void grantBadge(Long userId, Long badgeId) {
        Long existing = userBadgeMapper.selectCount(
                new LambdaQueryWrapper<UserBadge>()
                        .eq(UserBadge::getUserId, userId)
                        .eq(UserBadge::getBadgeId, badgeId));
        if (existing > 0) {
            log.debug("User {} already owns badge {}, skipping", userId, badgeId);
            return;
        }
        UserBadge userBadge = new UserBadge();
        userBadge.setUserId(userId);
        userBadge.setBadgeId(badgeId);
        userBadge.setEarnedAt(LocalDate.now());
        try {
            userBadgeMapper.insert(userBadge);
            log.info("Granted badge {} to user {}", badgeId, userId);
        } catch (DuplicateKeyException e) {
            log.debug("Duplicate badge grant ignored: user={}, badge={}", userId, badgeId);
        }
    }

    private void onProjectJoined(Long userId) {
        Long owned = userBadgeMapper.selectCount(
                new LambdaQueryWrapper<UserBadge>()
                        .eq(UserBadge::getUserId, userId)
                        .eq(UserBadge::getBadgeId, 2L));
        if (owned == 0) {
            grantBadge(userId, 2L);
        }
        Long approvedProjects = applicationMapper.selectCount(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getApplicantId, userId)
                        .eq(Application::getStatus, "approved"));
        if (approvedProjects >= 3) {
            grantBadge(userId, 14L);
        }
    }

    private void onTaskCompleted(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;
        Long completedTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getAssignee, user.getName())
                        .eq(Task::getStatus, "done"));
        if (completedTasks >= 1) {
            grantBadge(userId, 5L);
        }
        if (completedTasks >= 5) {
            grantBadge(userId, 6L);
        }
        if (completedTasks >= 10) {
            grantBadge(userId, 13L);
        }
    }

    private void onCommentPosted(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;
        Long commentCount = commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getUserName, user.getName()));
        if (commentCount >= 10) {
            grantBadge(userId, 3L);
        }
    }

    private void onProjectDone(Long authorId) {
        Long doneProjects = projectMapper.selectCount(
                new LambdaQueryWrapper<Project>()
                        .eq(Project::getAuthorId, authorId)
                        .eq(Project::getStatus, "done"));
        if (doneProjects >= 1) {
            Long owned = userBadgeMapper.selectCount(
                    new LambdaQueryWrapper<UserBadge>()
                            .eq(UserBadge::getUserId, authorId)
                            .eq(UserBadge::getBadgeId, 7L));
            if (owned == 0) {
                grantBadge(authorId, 7L);
            }
        }
    }

    private void onFirstLogin(Long userId) {
        grantBadge(userId, 1L);
    }
}
