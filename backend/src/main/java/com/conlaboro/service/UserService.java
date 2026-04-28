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
        if (req.getPreferences() != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                user.setPreferences(mapper.writeValueAsString(req.getPreferences()));
            } catch (Exception e) {
                log.warn("序列化 preferences 失败: {}", e.getMessage());
            }
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

        for (int nextLevel = currentLevel + 1; nextLevel < NEXT_LEVEL_XP.length; nextLevel++) {
            int xpThreshold = NEXT_LEVEL_XP[nextLevel - 1];
            if (currentXp >= xpThreshold) {
                user.setLevel(nextLevel);
                user.setLevelName(LEVEL_NAMES[nextLevel - 1]);
                userMapper.updateById(user);
                log.info("User {} leveled up to Lv.{} ({})", userId, user.getLevel(), user.getLevelName());

                try {
                    badgeAutoService.checkAndGrant(userId, "level_up");
                } catch (Exception e) {
                    log.warn("等级徽章授予失败: {}", e.getMessage());
                }
            } else {
                break;
            }
        }
    }

    /** 获取用户信息用于Token生成 */
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }

    /** 更新用户头像 URL */
    @Transactional
    public void updateAvatarUrl(Long userId, String avatarUrl) {
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setAvatarUrl(avatarUrl);
            userMapper.updateById(user);
        }
    }
}