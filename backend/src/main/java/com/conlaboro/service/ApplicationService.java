package com.conlaboro.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.conlaboro.common.ErrorCode;
import com.conlaboro.dto.ApplyRequest;
import com.conlaboro.entity.Application;
import com.conlaboro.entity.Project;
import com.conlaboro.exception.BizException;
import com.conlaboro.mapper.ApplicationMapper;
import com.conlaboro.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationMapper applicationMapper;
    private final ProjectMapper projectMapper;

    /** 申请加入项目 */
    @Transactional
    public Application apply(Long projectId, Long applicantId, ApplyRequest req) {
        // 检查项目存在
        Project project = projectMapper.selectById(projectId);
        if (project == null) throw new BizException(ErrorCode.PROJECT_NOT_FOUND);

        // 检查是否已申请
        Long existing = applicationMapper.selectCount(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getProjectId, projectId)
                        .eq(Application::getApplicantId, applicantId));
        if (existing > 0) {
            throw new BizException(409, "你已经申请过该项目");
        }

        Application app = new Application();
        app.setProjectId(projectId);
        app.setApplicantId(applicantId);
        app.setRoleName(req.getRoleName());
        app.setIntroduction(req.getIntroduction());
        app.setStatus("pending");
        app.setCreatedAt(OffsetDateTime.now());
        applicationMapper.insert(app);

        return app;
    }

    /** 获取项目的所有申请 */
    public List<Application> getProjectApplications(Long projectId) {
        return applicationMapper.selectList(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getProjectId, projectId)
                        .orderByAsc(Application::getCreatedAt));
    }

    /** 审批申请（通过/拒绝） */
    @Transactional
    public void review(Long applicationId, Long reviewerId, String action) {
        Application app = applicationMapper.selectById(applicationId);
        if (app == null) throw new BizException(ErrorCode.NOT_FOUND);
        if (!"pending".equals(app.getStatus())) {
            throw new BizException(400, "该申请已被处理");
        }

        String newStatus = "approve".equalsIgnoreCase(action) ? "approved" : "rejected";
        app.setStatus(newStatus);
        app.setReviewedBy(reviewerId);
        app.setReviewedAt(OffsetDateTime.now());
        applicationMapper.updateById(app);

        if ("approved".equals(newStatus)) {
            // 通过后，更新项目角色的 filled 计数（简化处理，实际可关联到具体角色）
            // 这里仅标记通过，角色成员管理在后续接口中处理
        }
    }
}
