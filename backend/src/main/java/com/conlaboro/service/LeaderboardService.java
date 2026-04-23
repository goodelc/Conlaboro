package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.User;
import com.conlaboro.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserMapper userMapper;

    public List<Map<String, Object>> getLeaderboard(String sortBy) {
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>()
                .eq(User::getDeleted, 0));

        String sortKey = (sortBy != null) ? sortBy : "xp";
        Comparator<User> comparator;
        switch (sortKey) {
            case "projects":
                comparator = Comparator.comparingInt(User::getProjectCount).reversed();
                break;
            case "badges":
                comparator = Comparator.comparingInt(User::getBadgeCount).reversed();
                break;
            default:
                comparator = Comparator.comparingInt(User::getXp).reversed();
                break;
        }

        return users.stream()
                .sorted(comparator)
                .map(u -> {
                    Map<String, Object> item = new java.util.HashMap<>();
                    item.put("id", u.getId());
                    item.put("name", u.getName());
                    item.put("color", u.getColor());
                    item.put("role", u.getRole());
                    item.put("level", u.getLevel());
                    item.put("levelName", u.getLevelName());
                    item.put("xp", u.getXp());
                    item.put("projectCount", u.getProjectCount());
                    item.put("badgeCount", u.getBadgeCount());
                    return item;
                })
                .collect(Collectors.toList());
    }
}
