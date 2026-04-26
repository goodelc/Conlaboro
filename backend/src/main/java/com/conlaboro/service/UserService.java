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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserSkillMapper skillMapper;
    private final UserBadgeMapper badgeMapper;

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
                skill.setPercentage(50); // 默认中级，后续可调整
                skillMapper.insert(skill);
            }
        }
    }
}
