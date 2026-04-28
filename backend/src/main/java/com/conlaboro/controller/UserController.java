package com.conlaboro.controller;

import com.conlaboro.common.Result;
import com.conlaboro.dto.UpdateProfileRequest;
import com.conlaboro.dto.UserProfileDTO;
import com.conlaboro.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private static final String UPLOAD_DIR = "uploads/avatars";

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

    /** 上传头像 */
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestAttribute("userId") Long userId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        String originalName = file.getOriginalFilename();
        String ext = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf(".")) : ".png";
        if (!".jpg.jpeg.png.gif.webp".contains(ext)) {
            throw new IllegalArgumentException("仅支持 jpg/png/gif/webp 格式");
        }
        try {
            Path dir = Paths.get(UPLOAD_DIR);
            if (!Files.exists(dir)) Files.createDirectories(dir);
            String filename = UUID.randomUUID().toString() + ext;
            Path target = dir.resolve(filename);
            file.transferTo(target.toFile());
            // 更新用户头像 URL
            String avatarUrl = "/api/uploads/avatars/" + filename;
            userService.updateAvatarUrl(userId, avatarUrl);
            return Result.ok(avatarUrl);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }
    }
}
