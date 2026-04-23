package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.Badge;
import com.conlaboro.entity.UserBadge;
import com.conlaboro.mapper.BadgeMapper;
import com.conlaboro.mapper.UserBadgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeMapper badgeMapper;
    private final UserBadgeMapper userBadgeMapper;

    public List<Badge> getAllBadges() {
        return badgeMapper.selectList(new LambdaQueryWrapper<Badge>()
                .orderByAsc(Badge::getId));
    }

    public List<Badge> getBadgesWithEarnStatus(Long userId) {
        List<Badge> all = getAllBadges();
        List<UserBadge> earned = userBadgeMapper.selectList(
                new LambdaQueryWrapper<UserBadge>().eq(UserBadge::getUserId, userId));
        Map<Long, Boolean> earnedMap = earned.stream()
                .collect(Collectors.toMap(UserBadge::getBadgeId, b -> true, (a, b) -> a));

        all.forEach(b -> b.setCondition(earnedMap.containsKey(b.getId()) ? "true" : "false"));
        return all;
    }
}
