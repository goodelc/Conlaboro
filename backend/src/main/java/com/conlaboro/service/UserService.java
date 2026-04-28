package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.dto.SkillDTO;
import com.conlaboro.dto.UpdateProfileRequest;
import com.conlaboro.dto.UserProfileDTO;
import com.conlaboro.entity.User;
import com.conlaboro.entity.UserSkill;
import com.conlaboro.entity.UserBadge;
import com.conlaboro.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserSkillMapper skillMapper;
    private final UserBadgeMapper badgeMapper;
    private final BadgeAutoService badgeAutoService;

    // 等级XP阈值配置
    private static final int[] NEXT_LEVEL_XP = {0, 100, 500, 1500, 4000, 10000, 99999};
    private static final String[] LEVEL_NAMES = {"新社员", "创客", "建设者", "骨干", "引领者", "先驱", "传奇"};

    public UserProfileDTO getUserProfile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return null;

        List<UserSkill> skills = skillMapper.selectList(
                new LambdaQueryWrapper<UserSkill>().eq(UserSkill::getUserId, userId));

        List<UserBadge> earnedBadges = badgeMapper.selectList(
                new LambdaQueryWrapper<UserBadge>().eq(UserBadge::getUserId, userId));

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setColor(user.getColor());
        dto.setRole(user.getRole());
        dto.setLevel(user.getLevel());
        dto.setLevelName(user.getLevelName());
        dto.setXp(user.getXp());
        dto.setProjectCount(user.getProjectCount());
        dto.setBadgeCount(user.getBadgeCount());
        dto.setJoinedAt(user.getJoinedAt());
        dto.setBio(user.getBio());

        dto.setSkills(skills.stream()
                .map(s -> new SkillDTO(s.getName(), s.getPercentage()))
                .collect(Collectors.toList()));

        dto.setEarnedBadgeIds(earnedBadges.stream()
                .map(UserBadge::getBadgeId)
                .collect(Collectors.toList()));

        return dto;
    }

    public List<UserProfileDTO> getAllUsers() {
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>()
                .orderByAsc(User::getId));
        
        return users.stream().map(user -> {
            List<UserSkill> skills = skillMapper.selectList(
                    new LambdaQueryWrapper<UserSkill>().eq(UserSkill::getUserId, user.getId()));

            List<UserBadge> earnedBadges = badgeMapper.selectList(
                    new LambdaQueryWrapper<UserBadge>().eq(UserBadge::getUserId, user.getId()));

            UserProfileDTO dto = new UserProfileDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setColor(user.getColor());
            dto.setRole(user.getRole());
            dto.setLevel(user.getLevel());
            dto.setLevelName(user.getLevelName());
            dto.setXp(user.getXp());
            dto.setProjectCount(user.getProjectCount());
            dto.setBadgeCount(user.getBadgeCount());
            dto.setJoinedAt(user.getJoinedAt());
            dto.setBio(user.getBio());

            dto.setSkills(skills.stream()
                    .map(s -> new SkillDTO(s.getName(), s.getPercentage()))
                    .collect(Collectors.toList()));

            dto.setEarnedBadgeIds(earnedBadges.stream()
                    .map(UserBadge::getBadgeId)
                    .collect(Collectors.toList()));

            return dto;
        }).collect(Collectors.toList());
    }

    /** 更新个人资料 */
    @Transactional
    public void updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userMapper.selectById(userId);
        if (user == null) return;

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName().trim());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio().trim());
        }
        userMapper.updateById(user);

        // 更新技能标签：先删后重建
        if (req.getSkillNames() != null) {
            skillMapper.delete(new LambdaQueryWrapper<UserSkill>().eq(UserSkill::getUserId, userId));
            for (String name : req.getSkillNames()) {
                UserSkill skill = new UserSkill();
                skill.setUserId(userId);
                skill.setName(name);
                skill.setPercentage(50);
                skillMapper.insert(skill);
            }
        }
    }

    /** 添加XP奖励 */
    @Transactional
    public void addXp(Long userId, int amount) {
        User user = userMapper.selectById(userId);
        if (user == null) return;

        int newXp = user.getXp() + amount;
        user.setXp(newXp);
        userMapper.updateById(user);

        log.info("User {} earned {} XP, total XP: {}", userId, amount, newXp);
        
        // 检查等级升级
        checkLevelUp(userId);
    }

    /** 检查并执行等级升级 */
    @Transactional
    public void checkLevelUp(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) return;

        int currentLevel = user.getLevel();
        int currentXp = user.getXp();

        // 从当前等级开始检查是否满足升级条件
        for (int level = currentLevel; level < NEXT_LEVEL_XP.length; level++) {
            if (level > 0 && currentXp >= NEXT_LEVEL_XP[level - 1]) {
                if (currentLevel < level + 1 && level + 1 <= LEVEL_NAMES.length) {
                    user.setLevel(level + 1);
                    user.setLevelName(LEVEL_NAMES[level]);
                    userMapper.updateById(user);
                    log.info("User {} leveled up to Lv.{} ({})", userId, user.getLevel(), user.getLevelName());
                    
                    // 触发等级徽章检查
                    try {
                        badgeAutoService.checkAndGrant(userId, "level_up");
                    } catch (Exception e) {
                        log.warn("等级徽章授予失败: {}", e.getMessage());
                    }
                }
            }
        }
    }

    /** 获取用户信息用于Token生成 */
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }
}