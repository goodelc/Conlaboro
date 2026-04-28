package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.dto.AuthResponse;
import com.conlaboro.dto.LoginRequest;
import com.conlaboro.dto.RegisterRequest;
import com.conlaboro.dto.ResetPasswordRequest;
import com.conlaboro.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Result<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return Result.ok(authService.register(req));
    }

    @PostMapping("/login")
    public Result<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return Result.ok(authService.login(req));
    }

    @GetMapping("/me")
    public Result<?> getCurrentUser(@RequestAttribute("userId") Long userId) {
        return Result.ok(authService.findById(userId));
    }

    /** 密码重置（简化版） */
    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getEmail(), req.getNewPassword());
        return Result.ok(null);
    }
}
