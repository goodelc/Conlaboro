package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.conlaboro.common.ErrorCode;
import com.conlaboro.entity.Idea;
import com.conlaboro.entity.IdeaLike;
import com.conlaboro.entity.IdeaComment;
import com.conlaboro.entity.User;
import com.conlaboro.exception.BizException;
import com.conlaboro.mapper.IdeaLikeMapper;
import com.conlaboro.mapper.IdeaMapper;
import com.conlaboro.mapper.IdeaCommentMapper;
import com.conlaboro.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdeaService {

    private final IdeaMapper ideaMapper;
    private final IdeaLikeMapper ideaLikeMapper;
    private final IdeaCommentMapper ideaCommentMapper;
    private final UserMapper userMapper;

    public Page<Idea> getIdeasPage(int page, int size, String keyword, String sortBy) {
        Page<Idea> pager = new Page<>(page, size);
        LambdaQueryWrapper<Idea> queryWrapper = new LambdaQueryWrapper<Idea>();
        
            // 搜索功能
        if (keyword != null && !keyword.isEmpty()) {
            queryWrapper.like(Idea::getContent, keyword)
                    .or().like(Idea::getAuthorName, keyword);
        }
        
        // 排序功能
        switch (sortBy) {
            case "mostLikes":
                queryWrapper.orderByDesc(Idea::getLikeCount).orderByDesc(Idea::getCreatedAt);
                break;
            case "mostComments":
                queryWrapper.orderByDesc(Idea::getCommentCount).orderByDesc(Idea::getCreatedAt);
                break;
            case "latest":
            default:
                queryWrapper.orderByDesc(Idea::getCreatedAt);
                break;
        }
        
        return ideaMapper.selectPage(pager, queryWrapper);
    }

    public Idea getIdeaById(Long id) {
        Idea idea = ideaMapper.selectById(id);
        if (idea == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        return idea;
    }

    @Transactional
    public Idea createIdea(String content, String authorName, Long userId) {
        Idea idea = new Idea();
        idea.setContent(content);
        idea.setAuthorName(authorName != null ? authorName : "匿名用户");
        if (userId != null) {
            idea.setUserId(userId);
        }
        idea.setLikeCount(0);
        idea.setCommentCount(0);
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

    public List<IdeaComment> getCommentsByIdeaId(Long ideaId) {
        Idea idea = ideaMapper.selectById(ideaId);
        if (idea == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        List<IdeaComment> comments = ideaCommentMapper.selectList(
                new LambdaQueryWrapper<IdeaComment>()
                        .eq(IdeaComment::getIdeaId, ideaId)
                        .orderByDesc(IdeaComment::getCreatedAt));
        // 填充每条评论的作者名
        for (IdeaComment comment : comments) {
            if (comment.getUserId() != null) {
                User user = userMapper.selectById(comment.getUserId());
                comment.setAuthorName(user != null ? user.getName() : "匿名用户");
            } else {
                comment.setAuthorName("匿名用户");
            }
        }
        return comments;
    }

    @Transactional
    public IdeaComment createComment(Long ideaId, Long userId, String content) {
        Idea idea = ideaMapper.selectById(ideaId);
        if (idea == null) {
            throw new BizException(ErrorCode.NOT_FOUND);
        }
        IdeaComment comment = new IdeaComment();
        comment.setIdeaId(ideaId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setCreatedAt(OffsetDateTime.now());
        ideaCommentMapper.insert(comment);
        // 更新评论计数
        idea.setCommentCount((idea.getCommentCount() != null ? idea.getCommentCount() : 0) + 1);
        idea.setUpdatedAt(OffsetDateTime.now());
        ideaMapper.updateById(idea);
        return comment;
    }
}