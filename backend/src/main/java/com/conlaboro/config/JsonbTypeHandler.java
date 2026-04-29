package com.conlaboro.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Map;

/**
 * MyBatis TypeHandler: Java Map ↔ PostgreSQL JSONB
 * 使用 PGobject 绑定参数类型为 jsonb，避免 varchar → jsonb 类型不匹配
 */
@MappedTypes(Map.class)
@MappedJdbcTypes(JdbcType.OTHER)
public class JsonbTypeHandler extends BaseTypeHandler<Map<String, Object>> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Map<String, Object> parameter, JdbcType jdbcType) throws SQLException {
        try {
            String json = MAPPER.writeValueAsString(parameter);
            ps.setObject(i, json, Types.OTHER);
        } catch (JsonProcessingException e) {
            throw new SQLException("Failed to serialize Map to JSON", e);
        }
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parse(rs.getString(columnName));
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parse(rs.getString(columnIndex));
    }

    @Override
    public Map<String, Object> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parse(cs.getString(columnIndex));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parse(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return MAPPER.readValue(json, Map.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
