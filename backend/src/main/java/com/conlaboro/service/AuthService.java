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

import java.time.LocalDate;

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
        user.setRole("新社员");
        user.setLevel(1);
        user.setLevelName("新社员");
        user.setXp(0);
        user.setProjectCount(0);
        user.setBadgeCount(0);
        user.setJoinedAt(LocalDate.now());
        user.setBio("");
        user.setDeleted(0);

        userMapper.insert(user);

        try {
            badgeAutoService.checkAndGrant(user.getId(), "first_login");
        } catch (Exception e) {
            log.warn("首次登录徽章授予失败（不影响注册流程）: {}", e.getMessage());
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), user.getColor());
        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, req.getEmail()));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BizException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), user.getColor());
        return buildAuthResponse(user, token);
    }

    public User findById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    /** 重置密码（简化版：通过邮箱验证后重置） */
    public void resetPassword(String email, String newPassword) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, email));
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND);
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BizException(ErrorCode.INVALID_CREDENTIALS); // 复用错误码：密码长度不足
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
        log.info("用户 {} 密码已重置", email);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .token(token)
                .color(user.getColor())
                .role(user.getRole())
                .level(user.getLevel())
                .levelName(user.getLevelName())
                .xp(user.getXp())
                .projectCount(user.getProjectCount())
                .badgeCount(user.getBadgeCount())
                .build();
    }

    private String generateColor() {
        String[] colors = {"#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
                           "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4"};
        return colors[(int)(Math.random() * colors.length)];
    }
}