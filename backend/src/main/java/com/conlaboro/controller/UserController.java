package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.dto.UpdateProfileRequest;
import com.conlaboro.dto.UserProfileDTO;
import com.conlaboro.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 获取用户详情 */
    @GetMapping("/{id}")
    public Result<UserProfileDTO> getProfile(@PathVariable Long id) {
        return Result.ok(userService.getUserProfile(id));
    }

    /** 获取所有用户 */
    @GetMapping
    public Result<?> getAllUsers() {
        return Result.ok(userService.getAllUsers());
    }

    /** 更新个人资料 */
    @PutMapping("/profile")
    public Result<Void> updateProfile(
            @Valid @RequestBody UpdateProfileRequest req,
            @RequestAttribute("userId") Long userId) {
        userService.updateProfile(userId, req);
        return Result.ok(null);
    }
}
