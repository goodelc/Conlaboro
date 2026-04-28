package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.Application;
import com.conlaboro.entity.Comment;
import com.conlaboro.entity.Project;
import com.conlaboro.entity.Task;
import com.conlaboro.entity.User;
import com.conlaboro.entity.UserBadge;
import com.conlaboro.entity.UserSkill;
import com.conlaboro.mapper.ApplicationMapper;
import com.conlaboro.mapper.CommentMapper;
import com.conlaboro.mapper.ProjectMapper;
import com.conlaboro.mapper.TaskMapper;
import com.conlaboro.mapper.UserBadgeMapper;
import com.conlaboro.mapper.UserMapper;
import com.conlaboro.mapper.UserSkillMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

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
    private final UserSkillMapper userSkillMapper;

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
            case "level_up":
                onLevelUp(userId);
                break;
            case "profile_completed":
                onProfileCompleted(userId);
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
            // 更新用户徽章数量
            User user = userMapper.selectById(userId);
            if (user != null) {
                user.setBadgeCount(user.getBadgeCount() + 1);
                userMapper.updateById(user);
            }
            log.info("Granted badge {} to user {}", badgeId, userId);
        } catch (DuplicateKeyException e) {
            log.debug("Duplicate badge grant ignored: user={}, badge={}", userId, badgeId);
        }
    }

    private void onFirstLogin(Long userId) {
        // 初心者徽章 - 首次登录
        grantBadge(userId, 1L);
    }

    private void onProfileCompleted(Long userId) {
        // 检查资料是否完善（有简介和至少一个技能）
        User user = userMapper.selectById(userId);
        if (user == null) return;
        
        if (user.getBio() != null && !user.getBio().isBlank()) {
            List<UserSkill> skills = userSkillMapper.selectList(
                    new LambdaQueryWrapper<UserSkill>().eq(UserSkill::getUserId, userId));
            if (!skills.isEmpty()) {
                grantBadge(userId, 0L); // 初心者徽章（完善资料）
            }
        }
    }

    private void onProjectJoined(Long userId) {
        // 第一把火徽章 - 加入第一个项目
        Long approvedCount = applicationMapper.selectCount(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getApplicantId, userId)
                        .eq(Application::getStatus, "approved"));
        
        if (approvedCount >= 1) {
            grantBadge(userId, 2L); // 第一把火
        }
        
        // 握手徽章 - 第一次被项目接受
        if (approvedCount >= 1) {
            grantBadge(userId, 3L); // 握手
        }
        
        // 桥梁徽章 - 参与5个不同类型项目
        if (approvedCount >= 5) {
            grantBadge(userId, 9L); // 桥梁
        }
    }

    private void onTaskCompleted(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;
        
        Long completedTasks = taskMapper.selectCount(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getAssignee, user.getName())
                        .eq(Task::getStatus, "done"));
        
        // 第一笔徽章 - 完成第一个任务
        if (completedTasks >= 1) {
            grantBadge(userId, 4L); // 第一笔
        }
        
        // 初出茅庐徽章 - 完成5个任务
        if (completedTasks >= 5) {
            grantBadge(userId, 15L); // 初出茅庐
        }
        
        // 代码之力徽章 - 完成10个任务
        if (completedTasks >= 10) {
            grantBadge(userId, 6L); // 代码之力
        }
        
        // 质量之盾徽章 - 完成20个任务
        if (completedTasks >= 20) {
            grantBadge(userId, 7L); // 质量之盾
        }
    }

    private void onCommentPosted(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;
        
        Long commentCount = commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getUserName, user.getName()));
        
        // 活跃评论者徽章 - 发表10条评论
        if (commentCount >= 10) {
            grantBadge(userId, 8L); // 导师徽章（评论贡献）
        }
        
        // 活跃社区成员徽章 - 发表50条评论
        if (commentCount >= 50) {
            grantBadge(userId, 10L); // 不灭徽章（活跃）
        }
    }

    private void onProjectDone(Long authorId) {
        Long doneProjects = projectMapper.selectCount(
                new LambdaQueryWrapper<Project>()
                        .eq(Project::getAuthorId, authorId)
                        .eq(Project::getStatus, "done"));
        
        // 领航者徽章 - 完成第一个项目
        if (doneProjects >= 1) {
            grantBadge(authorId, 11L); // 领航者
        }
        
        // 造物主徽章 - 完成3个项目
        if (doneProjects >= 3) {
            grantBadge(authorId, 14L); // 造物主
        }
    }

    private void onLevelUp(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;
        
        int level = user.getLevel();
        
        // 创客徽章 - 达到Lv.2
        if (level >= 2) {
            grantBadge(userId, 12L); // 公社之星徽章（等级奖励）
        }
        
        // 建设者徽章 - 达到Lv.3
        if (level >= 3) {
            grantBadge(userId, 13L); // 全栈创客徽章
        }
        
        // 骨干徽章 - 达到Lv.4
        if (level >= 4) {
            grantBadge(userId, 16L); // 骨干徽章（新增）
        }
    }

    /** 检查连续贡献徽章 */
    public void checkContinuousContribution(Long userId) {
        List<Comment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .orderByDesc(Comment::getTime)
                        .last("LIMIT 30"));
        
        if (comments.isEmpty()) return;
        
        LocalDate firstDate = comments.get(comments.size() - 1).getTime().toLocalDate();
        LocalDate lastDate = comments.get(0).getTime().toLocalDate();
        long daysBetween = ChronoUnit.DAYS.between(firstDate, lastDate);
        
        // 不灭徽章 - 连续30天有贡献
        if (daysBetween >= 30) {
            grantBadge(userId, 10L); // 不灭徽章
        }
    }
}