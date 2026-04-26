package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.common.ErrorCode;
import com.conlaboro.dto.AuthResponse;
import com.conlaboro.dto.LoginRequest;
import com.conlaboro.dto.RegisterRequest;
import com.conlaboro.entity.User;
import com.conlaboro.exception.BizException;
import com.conlaboro.mapper.UserMapper;
import com.conlaboro.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final BadgeAutoService badgeAutoService;

    public AuthResponse register(RegisterRequest req) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getEmail, req.getEmail()));
        if (count > 0) {
            throw new BizException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setColor(generateColor());
        user.setLevel(1);
        user.setLevelName("Newcomer");
        user.setXp(0);
        user.setProjectCount(0);
        user.setBadgeCount(0);
        user.setBio("");
        user.setDeleted(0);

        userMapper.insert(user);

        try {
            badgeAutoService.checkAndGrant(user.getId(), "first_login");
        } catch (Exception e) {
            log.warn("首次登录徽章授予失败（不影响注册流程）: {}", e.getMessage());
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, req.getEmail()));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BizException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), token);
    }

    public User findById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    private String generateColor() {
        String[] colors = {"#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
                           "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4"};
        return colors[(int)(Math.random() * colors.length)];
    }
}