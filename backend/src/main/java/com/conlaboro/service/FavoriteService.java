package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.entity.Favorite;
import com.conlaboro.mapper.FavoriteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteMapper favoriteMapper;

    @Transactional
    public void toggleFavorite(Long userId, Long projectId) {
        Long existing = favoriteMapper.selectCount(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .eq(Favorite::getProjectId, projectId));
        if (existing > 0) {
            // 已收藏 → 取消
            favoriteMapper.delete(new LambdaQueryWrapper<Favorite>()
                    .eq(Favorite::getUserId, userId)
                    .eq(Favorite::getProjectId, projectId));
        } else {
            // 未收藏 → 添加
            Favorite fav = new Favorite();
            fav.setUserId(userId);
            fav.setProjectId(projectId);
            fav.setCreatedAt(OffsetDateTime.now());
            favoriteMapper.insert(fav);
        }
    }

    public boolean isFavorited(Long userId, Long projectId) {
        return favoriteMapper.selectCount(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .eq(Favorite::getProjectId, projectId)) > 0;
    }

    public List<Long> getUserFavoriteIds(Long userId) {
        return favoriteMapper.selectList(
                new LambdaQueryWrapper<Favorite>().eq(Favorite::getUserId, userId))
                .stream().map(Favorite::getProjectId).toList();
    }
}
