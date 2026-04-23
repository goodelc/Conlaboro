package com.conlaboro.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.conlaboro.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
