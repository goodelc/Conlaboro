package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.dto.SkillDTO;
import com.conlaboro.dto.UserProfileDTO;
import com.conlaboro.entity.User;
import com.conlaboro.entity.UserSkill;
import com.conlaboro.entity.UserBadge;
import com.conlaboro.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public List<User> getAllUsers() {
        return userMapper.selectList(new LambdaQueryWrapper<User>()
                .orderByAsc(User::getId));
    }
}
