import { getProjectDetail, updateProject, createMilestone, updateMilestone, deleteMilestone } from '../api'

class ProjectService {
  /**
   * 获取项目详情
   * @param {number} projectId - 项目ID
   * @returns {Promise} 项目详情数据
   */
  async getProjectDetail(projectId) {
    try {
      return await getProjectDetail(projectId)
    } catch (error) {
      console.error('获取项目详情失败:', error)
      throw error
    }
  }

  /**
   * 更新项目信息
   * @param {number} projectId - 项目ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  async updateProject(projectId, data) {
    try {
      return await updateProject(projectId, data)
    } catch (error) {
      console.error('更新项目信息失败:', error)
      throw error
    }
  }

  /**
   * 创建里程碑
   * @param {number} projectId - 项目ID
   * @param {Object} data - 里程碑数据
   * @returns {Promise} 创建结果
   */
  async createMilestone(projectId, data) {
    try {
      return await createMilestone(projectId, data)
    } catch (error) {
      console.error('创建里程碑失败:', error)
      throw error
    }
  }

  /**
   * 更新里程碑
   * @param {number} milestoneId - 里程碑ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  async updateMilestone(milestoneId, data) {
    try {
      return await updateMilestone(milestoneId, data)
    } catch (error) {
      console.error('更新里程碑失败:', error)
      throw error
    }
  }

  /**
   * 删除里程碑
   * @param {number} milestoneId - 里程碑ID
   * @returns {Promise} 删除结果
   */
  async deleteMilestone(milestoneId) {
    try {
      return await deleteMilestone(milestoneId)
    } catch (error) {
      console.error('删除里程碑失败:', error)
      throw error
    }
  }
}

export default new ProjectService()