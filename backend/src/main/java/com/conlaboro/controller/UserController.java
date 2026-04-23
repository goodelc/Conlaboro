package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.dto.UserProfileDTO;
import com.conlaboro.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public Result<UserProfileDTO> getProfile(@PathVariable Long id) {
        return Result.ok(userService.getUserProfile(id));
    }

    @GetMapping
    public Result<?> getAllUsers() {
        return Result.ok(userService.getAllUsers());
    }
}
