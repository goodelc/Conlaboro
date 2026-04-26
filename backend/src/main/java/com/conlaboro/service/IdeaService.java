package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.conlaboro.common.ErrorCode;
import com.conlaboro.entity.Idea;
import com.conlaboro.entity.IdeaLike;
import com.conlaboro.exception.BizException;
import com.conlaboro.mapper.IdeaLikeMapper;
import com.conlaboro.mapper.IdeaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdeaService {

    private final IdeaMapper ideaMapper;
    private final IdeaLikeMapper ideaLikeMapper;

    public Page<Idea> getIdeasPage(int page, int size) {
        Page<Idea> pager = new Page<>(page, size);
        return ideaMapper.selectPage(pager, new LambdaQueryWrapper<Idea>()
                .orderByDesc(Idea::getCreatedAt));
    }

    @Transactional
    public Idea createIdea(String content, String authorName) {
        Idea idea = new Idea();
        idea.setContent(content);
        idea.setAuthorName(authorName != null ? authorName : "匿名用户");
        idea.setLikeCount(0);
        idea.setCreatedAt(OffsetDateTime.now());
        idea.setUpdatedAt(OffsetDateTime.now());
        ideaMapper.insert(idea);
        return idea;
    }

    @Transactional
    public void likeIdea(Long ideaId, Long userId) {
        Idea idea = ideaMapper.selectById(ideaId);
        if (idea == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        long existingCount = ideaLikeMapper.selectCount(
                new LambdaQueryWrapper<IdeaLike>()
                        .eq(IdeaLike::getIdeaId, ideaId)
                        .eq(IdeaLike::getUserId, userId));
        if (existingCount > 0) {
            throw new BizException(ErrorCode.CONFLICT);
        }
        IdeaLike like = new IdeaLike();
        like.setIdeaId(ideaId);
        like.setUserId(userId);
        like.setCreatedAt(OffsetDateTime.now());
        ideaLikeMapper.insert(like);
        idea.setLikeCount(idea.getLikeCount() + 1);
        idea.setUpdatedAt(OffsetDateTime.now());
        ideaMapper.updateById(idea);
    }

    @Transactional
    public void unlikeIdea(Long ideaId, Long userId) {
        Idea idea = ideaMapper.selectById(ideaId);
        if (idea == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        LambdaQueryWrapper<IdeaLike> wrapper = new LambdaQueryWrapper<IdeaLike>()
                .eq(IdeaLike::getIdeaId, ideaId)
                .eq(IdeaLike::getUserId, userId);
        IdeaLike like = ideaLikeMapper.selectOne(wrapper);
        if (like == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        ideaLikeMapper.deleteById(like.getId());
        idea.setLikeCount(Math.max(0, idea.getLikeCount() - 1));
        idea.setUpdatedAt(OffsetDateTime.now());
        ideaMapper.updateById(idea);
    }

    public boolean hasLiked(Long ideaId, Long userId) {
        Idea idea = ideaMapper.selectById(ideaId);
        if (idea == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        return ideaLikeMapper.selectCount(
                new LambdaQueryWrapper<IdeaLike>()
                        .eq(IdeaLike::getIdeaId, ideaId)
                        .eq(IdeaLike::getUserId, userId)) > 0;
    }
}